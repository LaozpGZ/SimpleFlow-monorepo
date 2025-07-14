import { useIntersectionObserver } from '@pancakeswap/hooks'
import { useTranslation } from '@pancakeswap/localization'
import { Box, Flex, Loading, SkeletonV2, TableView, Text, useMatchBreakpoints } from '@pancakeswap/uikit'
import { DoubleCurrencyLogo, FiatNumberDisplay, Liquidity } from '@pancakeswap/widgets-internal'
import { useHookByPoolId } from 'hooks/infinity/useHooksList'
import { useEffect, useMemo } from 'react'
import { InfinityPoolInfo, PoolInfo } from 'state/farmsV4/state/type'
import styled from 'styled-components'
import { isInfinityProtocol } from 'utils/protocols'
import { PoolGlobalAprButton } from 'views/universalFarms/components/PoolAprButton'

const PoolPairCell = styled(Flex)`
  align-items: center;
  gap: 12px;
`

const TokenSymbols = styled(Flex)`
  align-items: center;
  gap: 4px;
`

const SymbolText = styled(Text)`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`

const MobileCard = styled(Box)`
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};

  &:last-child {
    border-bottom: none;
  }
`

const MobileRow = styled(Flex)`
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
`

// Container for pools content (similar to universal farms)
const PoolsContent = styled.div`
  min-height: 200px;
`

interface PoolsTableProps {
  pools: PoolInfo[]
  loading: boolean
  isExtending?: boolean
  hasNextPage?: boolean
  onLoadMore?: () => void
}

// Helper function to prepare token data for DoubleCurrencyLogo
const prepareTokenForLogo = (token: any, poolChainId: number) => {
  if (!token) return null

  return {
    chainId: token.chainId || poolChainId,
    address: token.address || token.wrapped?.address,
    symbol: token.symbol || 'Unknown',
    name: token.name || token.symbol || 'Unknown',
    decimals: token.decimals || 18,
    isNative: token.isNative || false,
    isToken: token.isToken !== undefined ? token.isToken : true,
    wrapped: token.wrapped || {
      address: token.address || '0x',
      chainId: token.chainId || poolChainId,
      symbol: token.symbol || 'Unknown',
      name: token.name || token.symbol || 'Unknown',
      decimals: token.decimals || 18,
    },
    ...token,
  }
}

// Pool Token Overview Component (similar to universal farms)
const PoolTokenOverview = ({ data }: { data: PoolInfo }) => {
  const token0 = useMemo(() => prepareTokenForLogo(data.token0, data.chainId), [data.token0, data.chainId])
  const token1 = useMemo(() => prepareTokenForLogo(data.token1, data.chainId), [data.token1, data.chainId])

  const hookData = useHookByPoolId(
    data.chainId,
    isInfinityProtocol(data.protocol) ? (data as InfinityPoolInfo)?.poolId : undefined,
  )

  if (!token0 || !token1) {
    return null
  }

  return (
    <PoolPairCell>
      <DoubleCurrencyLogo currency0={token0} currency1={token1} size={40} showChainLogoCurrency1 />
      <TokenSymbols>
        <SymbolText>
          {token0.symbol} / {token1.symbol}
        </SymbolText>
        <Liquidity.PoolFeaturesBadge
          poolType={data.protocol}
          hookData={hookData}
          showLabel={false}
          showPoolType
          showPoolFeature={!!hookData}
          short
        />
      </TokenSymbols>
    </PoolPairCell>
  )
}

// Mobile Pool Item Component (to fix React Hook error)
const MobilePoolItem = ({ pool }: { pool: PoolInfo }) => {
  const { t } = useTranslation()
  const token0 = prepareTokenForLogo(pool.token0, pool.chainId)
  const token1 = prepareTokenForLogo(pool.token1, pool.chainId)

  const hookData = useHookByPoolId(
    pool.chainId,
    isInfinityProtocol(pool.protocol) ? (pool as InfinityPoolInfo)?.poolId : undefined,
  )

  if (!token0 || !token1) {
    return null
  }

  return (
    <MobileCard key={`${pool.chainId}-${pool.lpAddress}`}>
      <MobileRow>
        <PoolPairCell>
          <DoubleCurrencyLogo currency0={token0} currency1={token1} size={32} showChainLogoCurrency1 />
          <TokenSymbols>
            <SymbolText>
              {token0.symbol} / {token1.symbol}
            </SymbolText>
            <Liquidity.PoolFeaturesBadge
              poolType={pool.protocol}
              hookData={hookData}
              showLabel={false}
              showPoolType
              showPoolFeature={!!hookData}
              short
            />
          </TokenSymbols>
        </PoolPairCell>
      </MobileRow>

      <MobileRow>
        <Text color="textSubtle" fontSize="14px">
          {t('APR')}
        </Text>
        <PoolGlobalAprButton pool={pool} />
      </MobileRow>

      <MobileRow>
        <Text color="textSubtle" fontSize="14px">
          {t('TVL')}
        </Text>
        <FiatNumberDisplay value={pool.tvlUsd || 0} showFullDigitsTooltip={false} fontSize="16px" />
      </MobileRow>
    </MobileCard>
  )
}

// Mobile ListView Component
const MobileListView = ({ pools }: { pools: PoolInfo[] }) => {
  return (
    <Box>
      {pools.map((pool) => (
        <MobilePoolItem key={`${pool.chainId}-${pool.lpAddress}`} pool={pool} />
      ))}
    </Box>
  )
}

export const PoolsTable: React.FC<PoolsTableProps> = ({
  pools,
  loading,
  isExtending = false,
  hasNextPage = false,
  onLoadMore,
}) => {
  const { t } = useTranslation()
  const { isMobile } = useMatchBreakpoints()

  // IntersectionObserver for pagination (same as universal farms)
  const { observerRef, isIntersecting } = useIntersectionObserver()

  // Column configuration (similar to useColumnConfig in universal farms)
  const columns = useMemo(
    () => [
      {
        title: t('Pairs'),
        dataIndex: null as keyof PoolInfo | null,
        key: 'pairs',
        minWidth: '210px',
        render: (_, item: PoolInfo) => <PoolTokenOverview data={item} />,
      },
      {
        title: t('APR'),
        dataIndex: null as keyof PoolInfo | null,
        key: 'apr',
        minWidth: '125px',
        render: (_, item: PoolInfo) => <PoolGlobalAprButton pool={item} />,
      },
      {
        title: t('TVL'),
        dataIndex: 'tvlUsd' as keyof PoolInfo,
        key: 'tvl',
        minWidth: '125px',
        render: (value: number) => <FiatNumberDisplay value={value || 0} showFullDigitsTooltip={false} />,
      },
    ],
    [t],
  )

  const getRowKey = (item: PoolInfo) => `${item.chainId}-${item.lpAddress}`

  // Handle intersection observer pagination (same logic as universal farms)
  useEffect(() => {
    if (isIntersecting && hasNextPage && onLoadMore) {
      onLoadMore()
    }
  }, [isIntersecting, hasNextPage, onLoadMore])

  if (loading) {
    return (
      <Box>
        {[...Array(5)].map((_, index) => (
          <Box key={index} p="16px" borderBottom="1px solid" borderColor="cardBorder">
            <SkeletonV2 variant="rect" height={40} mb="8px" />
            <SkeletonV2 variant="rect" height={20} width="60%" />
          </Box>
        ))}
      </Box>
    )
  }

  if (pools.length === 0) {
    return (
      <Flex justifyContent="center" alignItems="center" minHeight="200px">
        <Text color="textSubtle">{t('No pools found')}</Text>
      </Flex>
    )
  }

  return (
    <PoolsContent>
      {/* Loading indicator for extending search (same as universal farms) */}
      {isExtending && (
        <Flex
          justifyContent="center"
          alignItems="center"
          width="100%"
          style={{
            height: '40px',
          }}
        >
          {t('Loading more pools...')}
          <Loading ml="8px" />
        </Flex>
      )}

      {/* Table/List content */}
      {isMobile ? <MobileListView pools={pools} /> : <TableView getRowKey={getRowKey} columns={columns} data={pools} />}

      {/* Intersection observer element for pagination (same as universal farms) */}
      {pools.length > 0 && hasNextPage && <div ref={observerRef} />}
    </PoolsContent>
  )
}
