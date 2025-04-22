import useAccountActiveChain from 'hooks/useAccountActiveChain'
import useCatchTxError from 'hooks/useCatchTxError'
import { atom, useAtom } from 'jotai'
import { useCallback, useMemo } from 'react'
import { GetContractFn } from 'utils/contractHelpers'
import { Abi, ContractFunctionArgs, ContractFunctionName } from 'viem'
import { WalletClient } from 'viem/_types/clients/createWalletClient'
import { useWalletClient } from 'wagmi'
import { useCallWithGasPrice } from './useCallWithGasPrice'

export const createWriteContractCallback = <
  TAbi extends Abi | readonly unknown[],
  TWalletClient extends WalletClient,
  TMethod extends ContractFunctionName<TAbi, 'nonpayable' | 'payable'>,
>(
  getContract: GetContractFn<TAbi, TWalletClient>,
  method: TMethod,
) => {
  const statusAtom = atom<string>('IDLE')
  const txHashAtom = atom<string>('')

  return () => {
    const { callWithGasPrice } = useCallWithGasPrice()
    const { fetchWithCatchTxError, loading } = useCatchTxError()
    const contract = useMemo(() => {
      return getContract()
    }, [getContract])
    const { account } = useAccountActiveChain()
    const [status, setStatus] = useAtom(statusAtom)
    const [txHash, setTxHash] = useAtom(txHashAtom)
    const { data: walletClient } = useWalletClient()

    const callMethod = useCallback(
      async (
        // @ts-ignore
        ...args: ContractFunctionArgs<TAbi, 'nonpayable' | 'payable', TMethod>
      ): Promise<
        | {
            hash: `0x${string}`
          }
        | undefined
      > => {
        setStatus('PENDING')
        const receipt = await fetchWithCatchTxError(async () => {
          const result = await callWithGasPrice(
            {
              abi: contract.abi as Abi,
              account: contract.account,
              chain: contract.chain,
              address: contract.address,
            },
            method,
            // @ts-ignore
            args,
          )
          setTxHash(result.hash)
          setStatus('CONFIRMING')
          return result
        })

        if (receipt?.status === 'success') {
          // const transactionReceipt = await waitForTransaction({ hash })
          setStatus('CONFIRMED')
          return
        }
        setStatus('FAILED')
      },
      [contract, account, setStatus, setTxHash, walletClient],
    )

    const caller = useCallback(
      (
        // @ts-ignore
        ...args: ContractFunctionArgs<TAbi, 'nonpayable' | 'payable', TMethod>
      ) => {
        return fetchWithCatchTxError(() => {
          // @ts-ignore
          return callMethod(...args)
        })
      },
      [callMethod],
    )

    return { callMethod: caller, status, txHash, loading }
  }
}
