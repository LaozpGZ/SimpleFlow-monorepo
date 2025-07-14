import { useTranslation } from '@pancakeswap/localization'
import { Box, Flex, SkeletonV2, Text, useMatchBreakpoints } from '@pancakeswap/uikit'
import { DoubleCurrencyLogo, FiatNumberDisplay, Liquidity } from '@pancakeswap/widgets-internal'
import { useHookByPoolId } from 'hooks/infinity/useHooksList'
import { FixedSizeList as List } from 'react-window'
import { InfinityPoolInfo, PoolInfo } from 'state/farmsV4/state/type'
import styled from 'styled-components'
import { isInfinityProtocol } from 'utils/protocols'
import { PoolGlobalAprButton } from 'views/universalFarms/components/PoolAprButton'

const TableContainer = styled.div`
  overflow-x: auto;
  width: 100%;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.input};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.textSubtle};
    border-radius: 3px;
  }
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
`

const Th = styled.th<{ $align?: string }>`
  padding: 12px;
  text-align: ${({ $align }) => $align || 'left'};
  color: ${({ theme }) => theme.colors.secondary};
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
`

const Td = styled.td<{ $align?: string }>`
  padding: 16px 12px;
  text-align: ${({ $align }) => $align || 'left'};
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};

  &:last-child {
    border-right: none;
  }
`

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

const VirtualizedContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 8px;
  overflow: hidden;
`

const AprContainer = styled(Flex)`
  justify-content: flex-start;
  align-items: center;
  width: 100%;
`

interface PoolsTableProps {
  pools: PoolInfo[]
  loading: boolean
}

// Helper function to prepare token data for DoubleCurrencyLogo
const prepareTokenForLogo = (token: any, poolChainId: number) => {
  if (!token) return null

  // Ensure the token has all required Currency properties
  return {
    chainId: token.chainId || poolChainId,
    address: token.address || token.wrapped?.address || '0x',
    symbol: token.symbol || 'Unknown',
    name: token.name || token.symbol || 'Unknown',
    decimals: token.decimals || 18,
    ...token,
  }
}

export const PoolsTable: React.FC<PoolsTableProps> = ({ pools, loading }) => {
  const { t } = useTranslation()
  const { isMobile } = useMatchBreakpoints()

  // Constants for virtual scrolling
  const DESKTOP_ITEM_HEIGHT = 72
  const MOBILE_ITEM_HEIGHT = 120
  const VISIBLE_ITEMS = 5
  const itemHeight = isMobile ? MOBILE_ITEM_HEIGHT : DESKTOP_ITEM_HEIGHT
  const containerHeight = itemHeight * VISIBLE_ITEMS

  // Desktop row renderer
  const DesktopRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const pool = pools[index]
    const token0 = prepareTokenForLogo(pool.token0, pool.chainId)
    const token1 = prepareTokenForLogo(pool.token1, pool.chainId)

    // Get hookData for Infinity pools
    const hookData = useHookByPoolId(
      pool.chainId,
      isInfinityProtocol(pool.protocol) ? (pool as InfinityPoolInfo)?.poolId : undefined,
    )

    if (!token0 || !token1 || !token0.chainId || !token1.chainId) {
      return null
    }

    return (
      <div style={style}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
          <tbody>
            <tr>
              <Td>
                <PoolPairCell>
                  <DoubleCurrencyLogo currency0={token0} currency1={token1} size={40} showChainLogoCurrency1 />
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
              </Td>
              <Td $align="right">
                <AprContainer>
                  <PoolGlobalAprButton pool={pool} />
                </AprContainer>
              </Td>
              <Td $align="right">
                <FiatNumberDisplay value={pool.tvlUsd || 0} showFullDigitsTooltip={false} />
              </Td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }

  // Mobile row renderer
  const MobileRowRenderer = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const pool = pools[index]
    const token0 = prepareTokenForLogo(pool.token0, pool.chainId)
    const token1 = prepareTokenForLogo(pool.token1, pool.chainId)

    // Get hookData for Infinity pools
    const hookData = useHookByPoolId(
      pool.chainId,
      isInfinityProtocol(pool.protocol) ? (pool as InfinityPoolInfo)?.poolId : undefined,
    )

    if (!token0 || !token1 || !token0.chainId || !token1.chainId) {
      return null
    }

    return (
      <div style={style}>
        <MobileCard>
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
            <AprContainer>
              <PoolGlobalAprButton pool={pool} />
            </AprContainer>
          </MobileRow>

          <MobileRow>
            <Text color="textSubtle" fontSize="14px">
              {t('TVL')}
            </Text>
            <FiatNumberDisplay value={pool.tvlUsd || 0} showFullDigitsTooltip={false} fontSize="16px" />
          </MobileRow>
        </MobileCard>
      </div>
    )
  }

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

  if (isMobile) {
    return (
      <VirtualizedContainer>
        <List height={containerHeight} width="100%" itemCount={pools.length} itemSize={itemHeight} itemData={pools}>
          {MobileRowRenderer}
        </List>
      </VirtualizedContainer>
    )
  }

  return (
    <TableContainer>
      <VirtualizedContainer>
        {/* Table header */}
        <Table>
          <thead>
            <tr>
              <Th>{t('Pairs')}</Th>
              <Th $align="right">{t('APR')}</Th>
              <Th $align="right">{t('TVL')}</Th>
            </tr>
          </thead>
        </Table>

        {/* Virtualized rows */}
        <List height={containerHeight} width="100%" itemCount={pools.length} itemSize={itemHeight} itemData={pools}>
          {DesktopRow}
        </List>
      </VirtualizedContainer>
    </TableContainer>
  )
}
