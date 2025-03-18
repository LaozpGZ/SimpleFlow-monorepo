import { useTheme } from '@pancakeswap/hooks'
import { useTranslation } from '@pancakeswap/localization'
import {
  Box,
  Button,
  Column,
  FlexGap,
  HelpIcon,
  LinkExternal,
  PageHeader,
  Row,
  Text,
  useMatchBreakpoints,
} from '@pancakeswap/uikit'
import { VerticalDivider } from '@pancakeswap/widgets-internal'
import { PickAdSlides } from 'components/AdPanel/PickAdSlides'
import { Suspense } from 'react'
import { useUserPancakePicks } from 'state/user/hooks/useUserPancakePicks'
import { FarmFlexWrapper, FarmH1, FarmH2 } from 'views/Farms/styled'

export const PoolsBanner = ({ additionLink }: { additionLink?: React.ReactNode }) => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { isMobile } = useMatchBreakpoints()
  const [isPancakePicks, setIsPancakePicks] = useUserPancakePicks(isMobile)

  return (
    <PageHeader style={isMobile ? { padding: '16px 0' } : undefined}>
      {isPancakePicks && isMobile && (
        <FlexGap width="100%" justifyContent="center" alignItems="center" mb="12px">
          <Suspense>
            <PickAdSlides isDismissible={false} />
          </Suspense>
        </FlexGap>
      )}
      <Column>
        <FarmFlexWrapper>
          <Box style={{ flex: '1 1 100%' }}>
            {!isMobile ? (
              <FarmH1 as="h1" scale="xxl" color="secondary" mb="24px">
                {t('Earn from LP')}
              </FarmH1>
            ) : (
              <FlexGap gap="16px">
                <FlexGap gap="3px">
                  <Text fontSize="20px" bold>
                    {t('Earn from')}
                  </Text>
                  <Text fontSize="20px" bold color="secondary">
                    {t('Farm / Liquidity')}
                  </Text>
                </FlexGap>
                <Button
                  width="40px"
                  height="40px"
                  variant="secondary"
                  px="14px"
                  scale="md"
                  onClick={() => setIsPancakePicks((prev) => !prev)}
                  style={{
                    borderColor: theme.colors.cardBorder,
                    backgroundColor: theme.colors.card,
                    borderWidth: '1px',
                  }}
                >
                  🔥
                </Button>
                <Button
                  width="40px"
                  height="40px"
                  variant="subtle"
                  px="16px"
                  scale="md"
                  onClick={() =>
                    window.open(
                      'https://docs.pancakeswap.finance/products/yield-farming/how-to-use-farms',
                      '_blank',
                      'noopener noreferrer',
                    )
                  }
                >
                  <HelpIcon color={theme.isDark ? '#280D5F' : 'white'} />
                </Button>
              </FlexGap>
            )}

            {!isMobile && (
              <>
                <FarmH2 scale="lg" color="text">
                  {t('Liquidity Pools & Farms')}
                </FarmH2>
                <Row flexWrap="wrap" gap="16px">
                  <LinkExternal
                    href="https://docs.pancakeswap.finance/products/yield-farming/how-to-use-farms"
                    showExternalIcon={false}
                  >
                    <Button p="0" variant="text">
                      <Text color="primary" bold fontSize="16px" mr="4px">
                        {t('Learn How')}
                      </Text>
                    </Button>
                  </LinkExternal>
                  {!!additionLink && (
                    <>
                      <VerticalDivider bg={theme.colors.inputSecondary} />
                      {additionLink}
                    </>
                  )}
                </Row>
              </>
            )}
          </Box>
          <Box>
            {!isMobile && (
              <Suspense>
                <PickAdSlides isDismissible={false} />
              </Suspense>
            )}
          </Box>
        </FarmFlexWrapper>
      </Column>
    </PageHeader>
  )
}
