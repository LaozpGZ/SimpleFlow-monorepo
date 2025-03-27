import { Protocol } from '@pancakeswap/farms'
import { INetworkProps, ITokenProps, toTokenValue } from '@pancakeswap/widgets-internal'
import { useMemo } from 'react'
import { getKeyForPools, useAccountInfinityBinPositions, useAccountInfinityCLPositions } from 'state/farmsV4/hooks'
import {
  InfinityBinPositionDetail,
  InfinityCLPositionDetail,
  POSITION_STATUS,
} from 'state/farmsV4/state/accountPositions/type'
import { useAccount } from 'wagmi'
import { InfinityPositionActions } from '../components/PositionActions/InfinityPositionActions'
import { InfinityBinPositionItem } from '../components/PositionItem/InfinityBinPositionItem'
import { InfinityCLPositionItem } from '../components/PositionItem/InfinityCLPositionItem'
import { useAllChainIds } from './useMultiChains'

type InfinityPositionItemsParams = {
  selectedNetwork: INetworkProps['value']
  selectedTokens: ITokenProps['value']
  positionStatus: POSITION_STATUS
  farmsOnly: boolean
}

export const useInfinityPositionItems = ({
  selectedNetwork,
  selectedTokens,
  positionStatus,
  farmsOnly,
}: InfinityPositionItemsParams) => {
  const { data: positions, isLoading } = useInfinityPositions()
  const filteredPositions = useMemo(
    () =>
      positions.filter(
        (pos) =>
          selectedNetwork.includes(pos.chainId) &&
          (!selectedTokens?.length ||
            selectedTokens.some(
              (token) =>
                (pos.poolKey?.currency0 &&
                  token === toTokenValue({ chainId: pos.chainId, address: pos.poolKey.currency0 })) ||
                (pos.poolKey?.currency1 &&
                  token === toTokenValue({ chainId: pos.chainId, address: pos.poolKey.currency1 })),
            )) &&
          (positionStatus === POSITION_STATUS.ALL || pos.status === positionStatus) &&
          (!farmsOnly || pos.isStaked),
      ),
    [selectedNetwork, selectedTokens, positions, positionStatus, farmsOnly],
  )

  const sortedPositions = useMemo(() => filteredPositions.sort((a, b) => a.status - b.status), [filteredPositions])

  const infinityPositionList = useMemo(
    () =>
      sortedPositions.map((pos) => {
        const { poolId, chainId } = pos
        const key = getKeyForPools({
          chainId,
          poolAddress: poolId,
          protocol: pos.protocol,
          tokenId:
            pos.protocol === Protocol.InfinityCLAMM
              ? (pos as InfinityCLPositionDetail).tokenId
              : (pos as InfinityBinPositionDetail).activeId.toString(),
        })
        if (pos.protocol === Protocol.InfinityCLAMM) {
          return (
            <InfinityCLPositionItem
              key={key}
              data={pos}
              action={<InfinityPositionActions pos={pos} positionList={positions} />}
            />
          )
        }
        if (pos.protocol === Protocol.InfinityBIN) {
          const p = pos as InfinityBinPositionDetail
          return (
            <InfinityBinPositionItem
              key={key}
              data={p}
              action={<InfinityPositionActions pos={p} positionList={sortedPositions} />}
            />
          )
        }
        return null
      }),
    [sortedPositions, positions],
  )

  return {
    infinityLoading: isLoading,
    infinityPositionList,
  }
}

export const useInfinityPositions = () => {
  const { address: account } = useAccount()
  const allChainIds = useAllChainIds()
  const { data: infinityCLPositions, pending: infinityCLLoading } = useAccountInfinityCLPositions(allChainIds, account)
  const { data: infinityBinPositions, pending: infinityBinLoading } = useAccountInfinityBinPositions(
    account,
    allChainIds,
  )

  const positions = useMemo(
    () =>
      ([] as Array<InfinityCLPositionDetail | InfinityBinPositionDetail>).concat(
        infinityCLPositions ?? [],
        infinityBinPositions ?? [],
      ),
    [infinityCLPositions, infinityBinPositions],
  )

  return {
    isLoading: infinityCLLoading || infinityBinLoading,
    data: positions,
  }
}
