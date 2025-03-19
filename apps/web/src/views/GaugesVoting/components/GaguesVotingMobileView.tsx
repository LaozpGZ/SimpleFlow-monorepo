import { useTranslation } from '@pancakeswap/localization'
import { Box, Card, Flex, Grid, Tab, TabMenu, Text, useMatchBreakpoints } from '@pancakeswap/uikit'
import Divider from 'components/Divider'
import FoldableText from 'components/FoldableSection/FoldableText'
import PinnedFAQButton from 'components/PinnedFAQButton'
import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useCakeLockStatus } from 'views/CakeStaking/hooks/useVeCakeUserInfo'
import faqConfig from '../faqConfig'
import { useGauges } from '../hooks/useGauges'
import { useGaugesQueryFilter } from '../hooks/useGaugesFilter'
import { useGaugesTotalWeight } from '../hooks/useGaugesTotalWeight'
import { useUserVoteGauges } from '../hooks/useUserVoteGauges'
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
  const { cakeLockedAmount } = useCakeLockStatus()
  const { data: userVotedGauges } = useUserVoteGauges()

  useEffect(() => {
    // If user has stake (veCake) or votes, default to "My veCake/Votes" tab
    if (cakeLockedAmount > 0n || (userVotedGauges && userVotedGauges.length > 0)) {
      setActiveTab(1)
    }
  }, [cakeLockedAmount, userVotedGauges])

  return (
    <StyledGaugesVotingPage>
      <Flex alignItems="baseline" width="100%" justifyContent="space-between" px="16px" py="16px">
        <Text lineHeight="110%" bold color="secondary" fontSize="32px">
          {t('Gauges Voting')}
        </Text>
        <PinnedFAQButton
          modalContent={
            <Box border="2px solid" borderColor="cardBorder" borderRadius="24px" backgroundColor="background">
              {faqConfig.map(({ title, description }, i) => {
                return (
                  // eslint-disable-next-line react/no-array-index-key
                  <FoldableText
                    expandableLabelProps={{
                      iconColor: 'secondary',
                      iconSize: '24px',
                    }}
                    wrapperProps={{
                      py: '4px',
                    }}
                    hideExpandableLabel
                    // eslint-disable-next-line react/no-array-index-key
                    key={i}
                    title={title}
                    borderBottom="1px solid"
                    borderColor="cardBorder"
                    px="20px"
                  >
                    {description.map((desc, index) => {
                      return (
                        // eslint-disable-next-line react/no-array-index-key
                        <Text key={index} color="textSubtle" as="p">
                          {desc}
                        </Text>
                      )
                    })}
                  </FoldableText>
                )
              })}
            </Box>
          }
        />
      </Flex>

      <Box px="40px">
        <TabMenu activeIndex={activeTab} onItemClick={setActiveTab} fullWidth={isMobile} isShowBorderBottom={false}>
          <Tab>
            {t('Gauges')} ({gauges?.length || 0})
          </Tab>
          <Tab>{t('My veCAKE/Votes')}</Tab>
        </TabMenu>
      </Box>

      <Box pl="16px" pr="16px" mt="0px" pb="32px">
        {activeTab === 0 ? (
          <Card>
            <Grid gridTemplateColumns={isDesktop ? '2.2fr 3fr' : '1fr'}>
              <CurrentEpoch />

              <Divider />

              <Box ml="0" mt={0} padding="8px 24px 8px 24px">
                <Text color="secondary" textTransform="uppercase" bold>
                  {t('proposed weights')}
                </Text>
                <Box mt="0" mb={0}>
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
              {t('Gauges')} ({filterGauges?.length || 0})
            </Text>

            <Grid p={16} gridTemplateColumns="1fr" gridGap="1em" position="sticky" top="0">
              <Grid gridTemplateColumns="2fr 1fr" gridGap="8px">
                <FilterFieldByTypeMobile onFilterChange={setFilter} value={filter} />
                <FilterFieldSort onChange={setSort} />
              </Grid>

              <FilterFieldInput placeholder={t('Search')} initialValue={searchText} onChange={setSearchText} />
            </Grid>

            <Divider />

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
