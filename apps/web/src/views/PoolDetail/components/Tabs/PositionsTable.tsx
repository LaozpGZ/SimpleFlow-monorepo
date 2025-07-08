import { Protocol } from '@pancakeswap/farms'
import { useTranslation } from '@pancakeswap/localization'
import { Box, CardBody, Flex, FlexGap, TableView, Text, Toggle } from '@pancakeswap/uikit'
import { displayApr } from '@pancakeswap/utils/displayApr'
import { LightCard, LightGreyCard } from '@pancakeswap/widgets-internal'
import { PoolInfo } from 'state/farmsV4/state/type'
import styled from 'styled-components'
import { isInfinityProtocol } from 'utils/protocols'
import { formatDollarAmount } from 'views/V3Info/utils/numbers'

const StyledCardBody = styled(CardBody)`
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
`

interface PositionsTableProps {
  data: any[]
  poolInfo?: PoolInfo | null
  totalLiquidityUSD: number
  totalApr: number
  showInactiveOnly: boolean
  toggleInactiveOnly: () => void
  harvestAllButton?: React.ReactNode
  totalEarnings?: string
}

export const PositionsTable: React.FC<PositionsTableProps> = ({
  poolInfo,
  totalLiquidityUSD,
  totalApr,
  showInactiveOnly,
  toggleInactiveOnly,
  harvestAllButton,
  totalEarnings,
  data,
}) => {
  const { t } = useTranslation()

  const { protocol } = poolInfo ?? {}

  if (!poolInfo) return null

  return (
    <LightCard padding="0" borderRadius="24px">
      <StyledCardBody>
        <Flex justifyContent="space-between" alignItems="center" flexWrap="wrap">
          <FlexGap gap="32px">
            <Box>
              <Text color="textSubtle">{t('Total Liquidity')}</Text>
              <Text fontSize="24px" bold>
                {formatDollarAmount(totalLiquidityUSD)}
              </Text>
            </Box>
            <Box>
              <Text color="textSubtle">{t('Total APR')}</Text>
              <Text fontSize="24px" bold>
                {displayApr(totalApr)}
              </Text>
            </Box>
          </FlexGap>

          <LightGreyCard padding="8px 16px" width="max-content" borderRadius="24px">
            <FlexGap gap="16px" alignItems="center">
              <Box>
                <Text color="textSubtle">{t('Total Earnings')}</Text>
                <Text fontSize="24px" bold>
                  {totalEarnings || '-'}
                </Text>
              </Box>
              {/* TODO: Update disable logic */}
              {/* <HarvestButton variant="tertiary" onClick={handleHarvestAll} disabled>
                {t('Harvest')}
              </HarvestButton> */}
              {harvestAllButton}
            </FlexGap>
          </LightGreyCard>
        </Flex>
      </StyledCardBody>

      <TableView
        columns={[
          {
            title: (
              <FlexGap gap="8px" alignItems="center">
                <Text color="textSubtle">{t('Inactive Only')}</Text>
                <Toggle checked={showInactiveOnly} onChange={toggleInactiveOnly} scale="sm" />
              </FlexGap>
            ),
            dataIndex: 'tokenInfo',
            key: 'tokenInfo',
            render: (tokenInfo) => <div>{tokenInfo}</div>,
          },
          {
            title: t('Liquidity'),
            dataIndex: 'liquidity',
            key: 'liquidity',
            render: (liquidity) => <div>{liquidity}</div>,
          },
          {
            title: t('Earnings'),
            dataIndex: 'earnings',
            key: 'earnings',
            render: (earnings) => <div>{earnings}</div>,
          },
          {
            title: t('APR'),
            dataIndex: 'apr',
            key: 'apr',
            render: (apr) => <div>{apr}</div>,
          },
          {
            title: t('Price Range (Min/Max)'),
            dataIndex: 'priceRange',
            key: 'priceRange',
            render: (priceRange) => <div>{priceRange}</div>,
            display: isInfinityProtocol(protocol) || protocol === Protocol.V3,
          },
          {
            title: '',
            dataIndex: 'actions',
            key: 'actions',
            render: (actions) => <div>{actions}</div>,
          },
        ]}
        data={data || []}
      />
    </LightCard>
  )
}
