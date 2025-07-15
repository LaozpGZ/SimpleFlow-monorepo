import { useIntersectionObserver } from '@pancakeswap/hooks'
import { useTranslation } from '@pancakeswap/localization'
import { Box, Flex, FlexGap, Loading, Skeleton, TableView, Text, useMatchBreakpoints } from '@pancakeswap/uikit'
import { DoubleCurrencyLogo, FiatNumberDisplay, Liquidity } from '@pancakeswap/widgets-internal'
import { useHookByPoolId } from 'hooks/infinity/useHooksList'
import { useCallback, useEffect, useMemo } from 'react'
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

// Table container with sticky header
const TableContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  overflow: hidden;
  max-height: 400px;
  overflow-y: auto;

  /* Make table header sticky */
  table thead {
    position: sticky;
    top: 0;
    z-index: 1;
    background: ${({ theme }) => theme.colors.backgroundAlt};

    th {
      background: ${({ theme }) => theme.colors.backgroundAlt};
    }

    tr {
      border-top: none;
    }
  }

  /* Add border to last row when not at bottom */
  table tbody tr:last-child td {
    border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
  }
`

const LoadMoreTrigger = styled.div`
  height: 20px;
  width: 100%;
`

const EmptyStateContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  width: 100%;
`

interface PoolsTableProps {
  pools: PoolInfo[]
  isLoading: boolean
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

export const PoolsTable: React.FC<PoolsTableProps> = ({ pools, isLoading, onLoadMore }) => {
  const { t } = useTranslation()
  const { isMobile } = useMatchBreakpoints()

  // IntersectionObserver for scroll-to-end pagination
  const { observerRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px',
  })

  // Column configuration (similar to useColumnConfig in universal farms)
  const columns = useMemo(
    () => [
      {
        title: t('Pairs'),
        dataIndex: null as keyof PoolInfo | null,
        key: 'pairs',
        minWidth: '210px',
        render: (_: unknown, item: PoolInfo) => <PoolTokenOverview data={item} />,
      },
      {
        title: t('APR'),
        dataIndex: null as keyof PoolInfo | null,
        key: 'apr',
        minWidth: '125px',
        render: (_: unknown, item: PoolInfo) => <PoolGlobalAprButton pool={item} />,
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

  const getRowKey = useCallback((item: PoolInfo) => `${item.chainId}-${item.lpAddress}`, [])

  // Handle intersection observer pagination
  useEffect(() => {
    if (isIntersecting && onLoadMore && !isLoading) {
      onLoadMore()
    }
  }, [isIntersecting, onLoadMore, isLoading])

  if (isLoading && pools.length === 0) {
    return (
      <TableContainer>
        {[...Array(5)].map((_: unknown, index) => (
          <Box key={index} p="16px" borderBottom="1px solid" borderColor="cardBorder">
            <FlexGap gap="16px" justifyContent="space-between" alignItems="center">
              <FlexGap gap="8px" alignItems="center">
                <Skeleton variant="circle" height={36} width={36} />
                <Skeleton variant="circle" height={36} width={36} />
              </FlexGap>

              <Skeleton height={40} width="100%" />

              <Skeleton height={40} width="20%" />
              <Skeleton height={40} width="30%" />
            </FlexGap>
          </Box>
        ))}
      </TableContainer>
    )
  }

  if (pools.length === 0 && !isLoading) {
    return (
      <TableContainer>
        <EmptyStateContainer>
          <Text color="textSubtle">{t('No pools found')}</Text>
        </EmptyStateContainer>
      </TableContainer>
    )
  }

  return (
    <>
      <TableContainer>
        {/* Use TableView with sticky header */}
        {isMobile ? (
          <MobileListView pools={pools} />
        ) : (
          <TableView getRowKey={getRowKey} columns={columns} data={pools} />
        )}
        {/* Loading indicator when loading more */}
        {isLoading && pools.length > 0 && (
          <Flex
            justifyContent="center"
            alignItems="center"
            width="100%"
            p="16px"
            borderTop="1px solid"
            borderColor="cardBorder"
          >
            <Loading mr="8px" />
            <Text color="textSubtle">{t('Loading more pools...')}</Text>
          </Flex>
        )}
        {/* Intersection observer element for pagination */}
        {pools.length > 0 && onLoadMore && !isLoading && <LoadMoreTrigger ref={observerRef} />}
      </TableContainer>
    </>
  )
}
