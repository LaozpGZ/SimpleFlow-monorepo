import { useTranslation } from '@pancakeswap/localization'
import { Box, Flex, Skeleton, Text, useMatchBreakpoints } from '@pancakeswap/uikit'
import { DoubleCurrencyLogo, FiatNumberDisplay } from '@pancakeswap/widgets-internal'
import { PoolInfo } from 'state/farmsV4/state/type'
import styled from 'styled-components'
import { PoolGlobalAprButtonV3 } from 'views/universalFarms/components/PoolAprButtonV3'
import { PoolFeatureTags } from './PoolFeatureTags'

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
  flex-direction: column;
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

  if (loading) {
    return (
      <Box>
        {[...Array(5)].map((_, index) => (
          <Box key={index} p="16px" borderBottom="1px solid" borderColor="cardBorder">
            <Skeleton height={40} mb="8px" />
            <Skeleton height={20} width="60%" />
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
      <Box>
        {pools.map((pool) => {
          const token0 = prepareTokenForLogo(pool.token0, pool.chainId)
          const token1 = prepareTokenForLogo(pool.token1, pool.chainId)

          if (!token0 || !token1 || !token0.chainId || !token1.chainId) {
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
                    <PoolFeatureTags pool={pool} />
                  </TokenSymbols>
                </PoolPairCell>
              </MobileRow>

              <MobileRow>
                <Text color="textSubtle" fontSize="14px">
                  {t('APR')}
                </Text>
                <PoolGlobalAprButtonV3 pool={pool} />
              </MobileRow>

              <MobileRow>
                <Text color="textSubtle" fontSize="14px">
                  {t('TVL')}
                </Text>
                <FiatNumberDisplay value={pool.tvlUsd || 0} showFullDigitsTooltip={false} fontSize="16px" />
              </MobileRow>
            </MobileCard>
          )
        })}
      </Box>
    )
  }

  return (
    <TableContainer>
      <Table>
        <thead>
          <tr>
            <Th>{t('Pairs')}</Th>
            <Th>{t('APR')}</Th>
            <Th>{t('TVL')}</Th>
          </tr>
        </thead>
        <tbody>
          {pools.map((pool) => {
            const token0 = prepareTokenForLogo(pool.token0, pool.chainId)
            const token1 = prepareTokenForLogo(pool.token1, pool.chainId)

            if (!token0 || !token1 || !token0.chainId || !token1.chainId) {
              return null
            }

            return (
              <tr key={`${pool.chainId}-${pool.lpAddress}`}>
                <Td>
                  <PoolPairCell>
                    <DoubleCurrencyLogo currency0={token0} currency1={token1} size={40} showChainLogoCurrency1 />
                    <TokenSymbols>
                      <SymbolText>
                        {token0.symbol} / {token1.symbol}
                      </SymbolText>
                      <PoolFeatureTags pool={pool} />
                    </TokenSymbols>
                  </PoolPairCell>
                </Td>
                <Td $align="right">
                  <PoolGlobalAprButtonV3 pool={pool} />
                </Td>
                <Td $align="right">
                  <FiatNumberDisplay value={pool.tvlUsd || 0} showFullDigitsTooltip={false} />
                </Td>
              </tr>
            )
          })}
        </tbody>
      </Table>
    </TableContainer>
  )
}
