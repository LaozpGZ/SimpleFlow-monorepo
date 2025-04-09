import { useTranslation } from '@pancakeswap/localization'
import { AutoColumn, Button, FlexGap, Grid, LogoRoundIcon, Text } from '@pancakeswap/uikit'
import { NextLinkFromReactRouter } from '@pancakeswap/widgets-internal'
import { LightGreyCard } from 'components/Card'
import styled from 'styled-components'
import { BurnLastSevenDaysCard } from './components/burns/BurnLastSevenDaysCard'
import { RealTimeBurnHistoryTable } from './components/burns/RealTimeBurnHistoryTable'
import { TotalDeflationCard } from './components/burns/TotalDeflationCard'
import { WeeklyBurnStackedChart } from './components/burns/WeeklyBurnStackedChart'
import { YTDBurnCard } from './components/burns/YTDBurnCard'
import { YTDDeflationCard } from './components/burns/YTDDeflationCard'
import { EmissionsLastSevenDaysCard } from './components/emissions/EmissionsLastSevenDaysCard'
import { WeeklyEmissionsStackedBarChart } from './components/emissions/WeeklyEmissionsStackedBarChart'
import { YTDEmissionsCard } from './components/emissions/YTDEmissionsCard'
import { SupplyDeflationCard } from './components/general/SupplyDeflationCombinedGraph'
import { SupplyPieChart } from './components/general/SupplyPieChart'

const StyledGradientCard = styled(LightGreyCard)`
  background: ${({ theme }) => theme.colors.gradientCardHeader};
  padding: 12px 16px;
  width: fit-content;
`

export const CakeDashboard = () => {
  const { t } = useTranslation()

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
      <FlexGap mt="24px" gap="16px" justifyContent="space-between" alignItems="center" flexWrap="wrap">
        <FlexGap alignItems="center" gap="8px" flexWrap="wrap">
          <LogoRoundIcon width="60px" height="60px" />
          <Text fontSize="56px" color="secondary" bold>
            {t('Burn Dashboard')}
          </Text>
        </FlexGap>
        <FlexGap alignItems="center" gap="8px" flexWrap="wrap">
          <StyledGradientCard>
            <Text bold>{t('Last updated at: 2025 -April-3, UTC 00:00')}</Text>
          </StyledGradientCard>
          <NextLinkFromReactRouter
            to="https://docs.pancakeswap.finance/governance-and-tokenomics/cake-tokenomics"
            target="_blank"
          >
            <Button variant="subtle" width="max-content">
              {t('Learn More')}
            </Button>
          </NextLinkFromReactRouter>
        </FlexGap>
      </FlexGap>

      <Grid mt="24px" gridTemplateColumns={['1fr', '1fr', '1fr', '1fr', '1fr', '4fr 3fr 2fr']} style={{ gap: '24px' }}>
        <SupplyPieChart />

        <AutoColumn gap="24px">
          <BurnLastSevenDaysCard />
          <TotalDeflationCard />
        </AutoColumn>
        <AutoColumn gap="24px">
          <YTDBurnCard />
          <YTDDeflationCard />
        </AutoColumn>
      </Grid>

      <SupplyDeflationCard mt="24px" />

      <WeeklyBurnStackedChart mt="24px" />

      <Text mt="40px" fontSize="24px" bold>
        {t('Real-Time Burn History')}
      </Text>
      <RealTimeBurnHistoryTable mt="24px" />

      <Text mt="40px" fontSize="24px" bold>
        {t('Emissions')}
      </Text>
      <Grid mt="24px" gridTemplateColumns={['1fr', '1fr', '1fr', '1fr 1fr']} style={{ gap: '24px' }}>
        <EmissionsLastSevenDaysCard />
        <YTDEmissionsCard />
      </Grid>

      <WeeklyEmissionsStackedBarChart mt="24px" />
    </div>
  )
}
