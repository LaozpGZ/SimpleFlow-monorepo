import { useTranslation } from '@pancakeswap/localization'
import { Box, Card, Grid, Tab, TabMenu, Text, useMatchBreakpoints } from '@pancakeswap/uikit'
import Divider from 'components/Divider'
import { useState } from 'react'
import styled from 'styled-components'
import { useGauges } from '../hooks/useGauges'
import { useGaugesQueryFilter } from '../hooks/useGaugesFilter'
import { useGaugesTotalWeight } from '../hooks/useGaugesTotalWeight'
import { CurrentEpoch } from './CurrentEpoch'
import { FilterFieldByTypeMobile, FilterFieldInput, FilterFieldSort } from './GaugesFilter'
import { GaugesList, VoteTable } from './Table'
import { WeightsPieChart } from './WeightsPieChart'

const StyledGaugesVotingPage = styled.div`
  background: transparent;

  ${({ theme }) => theme.mediaQueries.lg} {
    background: ${({ theme }) => theme.colors.gradientBubblegum};
  }
`

const GaugesVotingMobileView = () => {
  const { t } = useTranslation()
  const totalGaugesWeight = useGaugesTotalWeight()
  const { isDesktop, isMobile } = useMatchBreakpoints()
  const { data: gauges, isLoading } = useGauges()
  const { filterGauges, setSearchText, searchText, filter, setFilter, sort, setSort } = useGaugesQueryFilter(gauges)
  const [activeTab, setActiveTab] = useState(0)

  return (
    <StyledGaugesVotingPage>
      <Text px="16px" py="24px" lineHeight="110%" bold color="secondary" fontSize={['32px', '32px', '64px', '64px']}>
        {t('Gauges Voting')}
      </Text>

      <Box px="40px">
        <TabMenu activeIndex={activeTab} onItemClick={setActiveTab} fullWidth={isMobile} isShowBorderBottom={false}>
          <Tab>
            {t('Gauges')} ({filterGauges.length})
          </Tab>
          <Tab>{t('My veCAKE/Votes')}</Tab>
        </TabMenu>
      </Box>

      <Box
        pl={['16px', '16px', '24px']}
        pr={['16px', '16px', '24px']}
        mt={['0px', '0px', '32px', '-18px']}
        pb={['32px', '32px', '52px']}
      >
        {activeTab === 0 ? (
          <Card>
            <Grid gridTemplateColumns={isDesktop ? '2.2fr 3fr' : '1fr'}>
              <CurrentEpoch />

              <Divider />

              <Box ml={isDesktop ? '60px' : '0'} mt={0} padding={['16px', '16px', '16px 24px 24px']}>
                <Text color="secondary" textTransform="uppercase" bold>
                  {t('proposed weights')}
                </Text>
                <Box mt={isDesktop ? '40px' : '0'} mb={isDesktop ? '20px' : 0}>
                  <WeightsPieChart
                    data={filterGauges}
                    totalGaugesWeight={Number(totalGaugesWeight)}
                    isLoading={isLoading}
                  />
                </Box>
              </Box>
            </Grid>

            <Divider />

            <Text px={16} bold fontSize="24px">
              {t('Gauges')}
            </Text>

            <Grid p={16} gridTemplateColumns="1fr" gridGap="1em" position="sticky" top="0">
              <Grid gridTemplateColumns="2fr 1fr" gridGap="8px">
                <FilterFieldByTypeMobile onFilterChange={setFilter} value={filter} />
                <FilterFieldSort onChange={setSort} />
              </Grid>

              <FilterFieldInput placeholder={t('Search')} initialValue={searchText} onChange={setSearchText} />
            </Grid>

            <GaugesList
              key={sort}
              data={filterGauges}
              isLoading={isLoading}
              totalGaugesWeight={Number(totalGaugesWeight)}
            />
          </Card>
        ) : (
          <VoteTable />
        )}
      </Box>
    </StyledGaugesVotingPage>
  )
}

export default GaugesVotingMobileView
