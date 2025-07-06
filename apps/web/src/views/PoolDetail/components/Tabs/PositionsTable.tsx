import { Protocol } from '@pancakeswap/farms'
import { useTranslation } from '@pancakeswap/localization'
import { Box, Button, CardBody, Flex, FlexGap, TableView, Text, Toggle } from '@pancakeswap/uikit'
import { displayApr } from '@pancakeswap/utils/displayApr'
import { LightCard, LightGreyCard } from '@pancakeswap/widgets-internal'
import { PoolInfo } from 'state/farmsV4/state/type'
import styled from 'styled-components'
import { isInfinityProtocol } from 'utils/protocols'
import { formatDollarAmount } from 'views/V3Info/utils/numbers'

const HarvestButton = styled(Button)`
  border: 2px solid ${({ theme }) => theme.colors.primary};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.primary60};
  font-weight: 600;
  font-size: 16px;
  padding: 8px 16px;
  border-radius: 16px;
  &:hover {
    opacity: 0.8;
  }
`

const StyledCardBody = styled(CardBody)`
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
`

interface PositionsTableProps {
  poolInfo?: PoolInfo | null
  totalLiquidityUSD: number
  totalApr: number
  handleHarvestAll: () => void
  data: any[]
}

export const PositionsTable: React.FC<PositionsTableProps> = ({
  poolInfo,
  totalLiquidityUSD,
  totalApr,
  handleHarvestAll,
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
                  --
                </Text>
              </Box>
              <HarvestButton variant="tertiary" onClick={handleHarvestAll}>
                {t('Harvest')}
              </HarvestButton>
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
                <Toggle checked={false} onChange={() => {}} scale="sm" />
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
      {/* <TableWrapper>
        <AutoColumn gap="16px">
          <TableHeader>
            <ClickableColumnHeader color="secondary" textTransform="uppercase">
              {t('Liquidity')}
              <SortButton scale="sm" variant="subtle">
                <SortArrowIcon />
              </SortButton>
            </ClickableColumnHeader>
            <ClickableColumnHeader color="secondary" textTransform="uppercase">
              {t('Earnings')}
              <SortButton scale="sm" variant="subtle">
                <SortArrowIcon />
              </SortButton>
            </ClickableColumnHeader>
            <ClickableColumnHeader color="secondary" textTransform="uppercase">
              {t('APR')}
              <SortButton scale="sm" variant="subtle">
                <SortArrowIcon />
              </SortButton>
            </ClickableColumnHeader>
            {isInfinityProtocol(protocol) || protocol === Protocol.V3 ? (
              <ClickableColumnHeader color="secondary" textTransform="uppercase">
                {t('Price Range (Min/Max)')}
              </ClickableColumnHeader>
            ) : null}
            <ClickableColumnHeader color="secondary" textTransform="uppercase">
              {t('Actions')}
              <SortButton scale="sm" variant="subtle">
                <SortArrowIcon />
              </SortButton>
            </ClickableColumnHeader>
          </TableHeader>
        </AutoColumn>
      </TableWrapper> */}
    </LightCard>
  )
}
