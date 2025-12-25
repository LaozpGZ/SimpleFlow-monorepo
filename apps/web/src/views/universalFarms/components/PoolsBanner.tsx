import { useTheme } from '@simpleflow/hooks'
import { useTranslation } from '@simpleflow/l10n'
import {
  Box,
  Button,
  Column,
  darkColors,
  FlexGap,
  HelpIcon,
  lightColors,
  LinkExternal,
  PageHeader,
  Row,
  Text,
  useMatchBreakpoints,
} from '@simpleflow/uikit'
import { VerticalDivider } from '@simpleflow/widgets-internal'
import { PickAdSlides } from 'components/AdPanel/PickAdSlides'
import LiquiditySunsetWarning from 'components/Liquidity/LiquiditySunsetWarning'
import { Suspense, useCallback } from 'react'
import { useUserPancakePicks } from 'state/user/hooks/useUserPancakePicks'
import styled from 'styled-components'
import { FarmFlexWrapper, FarmH1, FarmH2 } from 'views/Farms/styled'

const StyledPageHeader = styled(PageHeader)`
  background: ${({ theme }) => (theme.isDark ? undefined : theme.colors.gradientBubblegum)};
`
export const PoolsBanner = ({ additionLink }: { additionLink?: React.ReactNode }) => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { isMobile } = useMatchBreakpoints()
  const [isPancakePicks, setIsPancakePicks] = useUserPancakePicks(isMobile)

  const handleLearnMoreClick = useCallback(() => {
    if (typeof window !== 'undefined' && window) {
      window.open(
        'https://docs.simpleflow.finance/products/yield-farming/how-to-use-farms',
        '_blank',
        'noopener noreferrer',
      )
    }
  }, [])

  return (
    <StyledPageHeader
      style={isMobile ? { padding: '16px 0' } : undefined}
      innerProps={isMobile ? { style: { padding: '0 16px' } } : undefined}
    >
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
              <FarmH1 as="h1" scale="xxl" color="secondary" mb="24px" style={{ textAlign: 'center' }}>
                {t('Earn from LP')}
              </FarmH1>
            ) : (
              <FlexGap gap="12px" justifyContent="space-between" alignItems="center">
                <FlexGap gap="3px">
                  <Text fontSize="20px" bold style={{ whiteSpace: 'nowrap' }}>
                    {t('Earn from')}
                  </Text>
                  <Text fontSize="20px" bold color="secondary" style={{ whiteSpace: 'nowrap' }}>
                    {t('Farm / Liquidity')}
                  </Text>
                </FlexGap>
                <FlexGap gap="12px">
                  <Button
                    width="40px"
                    height="40px"
                    variant="secondary"
                    px="14px"
                    scale="md"
                    onClick={() => setIsPancakePicks((prev) => !prev)}
                    style={{
                      borderColor: isPancakePicks ? theme.colors.cardBorder : theme.colors.inputSecondary,
                      backgroundColor: isPancakePicks ? theme.colors.card : theme.colors.input,
                      borderWidth: '1px',
                      transition: 'borderColor 0.25s ease-in, backgroundColor 0.25s ease-in',
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
                    onClick={handleLearnMoreClick}
                  >
                    {/* can't use theme directly, in this case it's applying the reversed theme */}
                    <HelpIcon color={theme.isDark ? lightColors.text : darkColors.contrast} />
                  </Button>
                </FlexGap>
              </FlexGap>
            )}

            {!isMobile && (
              <>
                <FarmH2 scale="lg" color="text" style={{ textAlign: 'center' }}>
                  {t('Liquidity Pools & Farms')}
                </FarmH2>
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
      <LiquiditySunsetWarning />
    </StyledPageHeader>
  )
}
