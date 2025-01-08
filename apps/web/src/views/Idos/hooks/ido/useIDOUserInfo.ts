import { useQuery } from '@tanstack/react-query'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { useIDOContract } from 'hooks/useContract'

export type IDOUserInfo = {
  amountPool: bigint
  claimedPool: boolean
}

export const useIDOUserInfo = () => {
  const { chainId, account } = useAccountActiveChain()
  const idoContract = useIDOContract()

  return useQuery({
    queryKey: ['idoUserInfo', account, chainId],
    queryFn: async (): Promise<IDOUserInfo> => {
      if (!account || !idoContract) throw new Error('IDO contract not found')

      const [amountPool, claimedPool] = await idoContract.read.viewUserInfo([account])
      return {
        amountPool,
        claimedPool,
      }
    },
    enabled: !!account && !!idoContract,
  })
}
