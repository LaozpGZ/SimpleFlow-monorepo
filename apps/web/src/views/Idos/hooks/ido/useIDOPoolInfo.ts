import { useQuery } from '@tanstack/react-query'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useIDOContract } from 'hooks/useContract'
import { getViemClients } from 'utils/viem'

export type IDOPoolInfo = {
  /**
   * Amount of tokens raised in the pool
   */
  raisingAmountPool: bigint
  /**
   * Amount of tokens offered in the pool
   */
  offeringAmountPool: bigint
  /**
   * Maximum amount of tokens a user can stake in the pool
   */
  capPerUserInLP: bigint
  /**
   * Whether the pool has a tax
   */
  hasTax: boolean
  /**
   * Flat tax rate
   */
  flatTaxRate: bigint
  /**
   * Total amount of tokens staked in the pool
   */
  totalAmountPool: bigint
  /**
   * Sum of taxes overflow
   */
  sumTaxesOverflow: bigint
  /**
   * Start timestamp of the pool
   */
  startTimestamp: number
  /**
   * End timestamp of the pool
   */
  endTimestamp: number
}

export const useIDOPoolInfo = () => {
  const { chainId } = useActiveChainId()
  const idoContract = useIDOContract()

  return useQuery({
    queryKey: ['idoPoolInfo', chainId],
    queryFn: async (): Promise<IDOPoolInfo> => {
      const publicClient = getViemClients({ chainId })
      if (!idoContract || !publicClient) throw new Error('IDO contract not found')

      const [
        [raisingAmountPool, offeringAmountPool, capPerUserInLP, hasTax, flatTaxRate, totalAmountPool, sumTaxesOverflow],
        startTimestamp,
        endTimestamp,
      ] = await publicClient.multicall({
        contracts: [
          {
            address: idoContract.address,
            abi: idoContract.abi,
            functionName: 'viewPoolInformation',
          },
          {
            address: idoContract.address,
            abi: idoContract.abi,
            functionName: 'startTimestamp',
          },
          {
            address: idoContract.address,
            abi: idoContract.abi,
            functionName: 'endTimestamp',
          },
        ],
        allowFailure: false,
      })

      return {
        raisingAmountPool,
        offeringAmountPool,
        capPerUserInLP,
        hasTax,
        flatTaxRate,
        totalAmountPool,
        sumTaxesOverflow,
        startTimestamp: Number(startTimestamp),
        endTimestamp: Number(endTimestamp),
      }
    },
    enabled: !!idoContract,
  })
}
