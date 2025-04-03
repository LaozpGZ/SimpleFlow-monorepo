import { useTranslation } from '@pancakeswap/localization'
import { Button, Flex, FlexGap, Grid, LogoRoundIcon, Text } from '@pancakeswap/uikit'
import { NextLinkFromReactRouter } from '@pancakeswap/widgets-internal'
import { useRef } from 'react'
import { CakeHoldersCard } from './components/general/CakeHoldersCard'
import { CumulativeDeflationCard } from './components/general/CumulativeDeflationCard'
import { FDVCard } from './components/general/FDVCard'
import { MarketCapCard } from './components/general/MarketCapCard'
import { SupplyCard } from './components/general/SupplyCard'
import { SupplyDeflationCard } from './components/general/SupplyDeflationCard'

export const CakeDashboard = () => {
  const { t } = useTranslation()
  const chartRef = useRef<HTMLDivElement>(null)

  // const { data } = useQuery({
  //   queryKey: ['burnStats'],
  //   queryFn: async () => {
  //     const response = await fetch('/api/stats')
  //     if (!response.ok) {
  //       throw new Error('Error while fetching burn statistics')
  //     }
  //     return response.json()
  //   },
  //   initialData: {},
  // })

  // const { netMintCumulative, circulatingSupply, netMintWeekly, weeklyTotalBurn, weeklyBurnBreakdown } = data

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <FlexGap alignItems="center" gap="8px" flexWrap="wrap">
        <LogoRoundIcon width="60px" height="60px" />
        <Text fontSize="32px" bold>
          {t('Burn Dashboard')}
        </Text>
      </FlexGap>

      <Flex mt="24px" justifyContent="space-between" alignItems="center" flexWrap="wrap">
        <Text fontSize="24px" bold>
          {t('General Overview')}
        </Text>
        <NextLinkFromReactRouter
          to="https://docs.pancakeswap.finance/governance-and-tokenomics/cake-tokenomics"
          target="_blank"
        >
          <Button variant="subtle">{t('Learn More')}</Button>
        </NextLinkFromReactRouter>
      </Flex>

      <Grid
        mt="24px"
        gridTemplateColumns={['1fr', '1fr', '1fr', '2fr 1fr']}
        gridTemplateRows={['1fr 1fr 1fr']}
        style={{ gap: '24px' }}
      >
        <SupplyCard style={{ gridColumn: 1, gridRow: 'span 3' }} />
        <MarketCapCard />
        <FDVCard />
        <CakeHoldersCard />
      </Grid>

      <SupplyDeflationCard mt="24px" />
      <CumulativeDeflationCard mt="24px" />

      {/* <Text>Net Mint Cumulative</Text>
      {netMintCumulative && (
        <AreaChart
          width={500}
          height={300}
          data={netMintCumulative?.data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <Area
            type="monotone"
            dataKey="cumulative_net_mint"
            stroke="#8884d8"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 8 }}
          />
          <Tooltip />
        </AreaChart>
      )}

      <Text>Circulating Supply</Text>
      {circulatingSupply && (
        <LineChart
          width={500}
          height={300}
          data={circulatingSupply?.data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <Line
            type="monotone"
            dataKey="circulating_supply"
            stroke="#aa5d12"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 8 }}
          />
          <Line
            type="monotone"
            dataKey="total_supply"
            stroke="#8884d8"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 8 }}
          />
          <Tooltip />
        </LineChart>
      )}

      <Text>Net Mint Weekly</Text>
      {netMintWeekly && (
        <BarChart
          width={500}
          height={300}
          data={netMintWeekly?.data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <Bar type="monotone" dataKey="net_mint" fill="#8884d8" strokeWidth={2} />
          <Tooltip />
        </BarChart>
      )}

      <Text>Weekly Total Burn</Text>
      {weeklyTotalBurn && (
        <BarChart
          width={500}
          height={300}
          data={weeklyTotalBurn?.data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <Bar type="monotone" dataKey="burn" fill="#8884d8" strokeWidth={2} />
          <Tooltip />
        </BarChart>
      )}

      <Text>Weekly Burn Breakdown</Text>
      {weeklyBurnBreakdown && (
        <BarChart
          width={500}
          height={300}
          data={weeklyBurnBreakdown?.data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <Bar type="monotone" dataKey="burn" fill="#8884d8" strokeWidth={2} />
          <Tooltip />
        </BarChart>
      )} */}
    </div>
  )
}
