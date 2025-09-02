import { useQuery } from '@tanstack/react-query'
import { useUserSlippage } from '@pancakeswap/utils/user'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { BridgeOrderWithCommands } from 'views/Swap/utils'
import { getEVMToSolanaBridgeCalldata } from '../api'
import { STEP_ID } from '../relay-sdk/types'

interface UseEVMToSolanaBridgeCalldataParams {
  order?: BridgeOrderWithCommands
  stepType?: STEP_ID
  enabled?: boolean
}

export const useEVMToSolanaBridgeCalldata = ({
  order,
  stepType = STEP_ID.DEPOSIT,
  enabled = true,
}: UseEVMToSolanaBridgeCalldataParams) => {
  const { account, solanaAccount } = useAccountActiveChain()
  const [allowedSlippage] = useUserSlippage()

  return useQuery({
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

      const calldata = await getEVMToSolanaBridgeCalldata({
        order,
        recipient: solanaAccount,
        user: account,
        allowedSlippage,
        stepType,
      })

      return calldata
    },
    enabled: enabled && !!order && !!account && !!solanaAccount,
    retry: 3,
    refetchOnWindowFocus: false,
  })
}
