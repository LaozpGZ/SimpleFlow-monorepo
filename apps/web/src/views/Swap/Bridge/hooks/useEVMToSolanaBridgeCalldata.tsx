import { useQuery } from '@tanstack/react-query'
import { useUserSlippage } from '@pancakeswap/utils/user'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { BridgeOrderWithCommands } from 'views/Swap/utils'
import { Calldata } from 'hooks/usePermit2'
import { STEP_ID } from '../relay-sdk/types'
import { getSolanaBridgeCalldata } from '../api'

interface UseEVMToSolanaBridgeCalldataParams {
  order?: BridgeOrderWithCommands
  stepType?: STEP_ID
  enabled?: boolean
}

export const useEVMToSolanaBridgeCalldata = ({
  order,
  stepType = STEP_ID.DEPOSIT,
  enabled = true,
}: UseEVMToSolanaBridgeCalldataParams):
  | {
      transactionData: Calldata
      gasFee: string
    }
  | undefined => {
  const { account, solanaAccount } = useAccountActiveChain()
  const [allowedSlippage] = useUserSlippage()

  const { data } = useQuery<
    {
      id: STEP_ID
      txnCalldata: {
        transactionData: Calldata
        gasFee: string
      }
    }[]
  >({
    queryKey: [
      'evm-to-solana-bridge-calldata',
      order?.trade?.inputAmount?.currency?.chainId,
      order?.trade?.outputAmount?.currency?.chainId,
      order?.trade?.outputAmount?.quotient?.toString(),
      solanaAccount,
      account,
    ],
    queryFn: async () => {
      if (!order || !solanaAccount || !account) {
        return undefined
      }

      const calldataResponse = await getSolanaBridgeCalldata({
        order,
        recipient: solanaAccount,
        user: account,
        allowedSlippage,
      })

      return calldataResponse?.steps?.map((step) => {
        const sD = step.items[0].data
        return {
          id: step.id,
          txnCalldata: {
            transactionData: {
              address: sD.to,
              calldata: sD.data,
              value: sD.value,
            } as Calldata,
            gasFee: sD.gas,
          },
        }
      })
    },
    enabled: enabled && !!order && !!account && !!solanaAccount,
    retry: 3,
    refetchOnWindowFocus: false,
  })

  return data?.find((step) => step.id === stepType)?.txnCalldata
}
