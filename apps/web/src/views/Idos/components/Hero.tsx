import { useTranslation } from '@pancakeswap/localization'
import { Box, Button, Container, Flex, FlexGap, Heading, Text, useMatchBreakpoints } from '@pancakeswap/uikit'
import { useRouter } from 'next/router'
import { styled } from 'styled-components'

const StyledHero = styled(Box)`
  position: relative;
  overflow: hidden;
`

const StyledHeading = styled(Heading)`
  font-size: 2.5rem;
  color: ${({ theme }) => theme.colors.text};

  ${({ theme }) => theme.mediaQueries.md} {
    font-size: 4rem;
  }
`

const DesktopButton = styled(Button)`
  align-self: flex-end;

  &:hover {
    opacity: 1 !important;
  }
`

const StyledSubTitle = styled(Text)`
  font-size: 16px;

  ${({ theme }) => theme.mediaQueries.md} {
    font-size: 20px;
  }
`

const Hero = () => {
  const router = useRouter()
  const { t } = useTranslation()
  const { isMobile } = useMatchBreakpoints()

  const handleClick = () => {
    const howToElem = document.getElementById('ifo-how-to')
    if (howToElem != null) {
      howToElem.scrollIntoView()
    } else {
      router.push('/ido#ifo-how-to')
    }
  }

  return (
    <Box mb="24px">
      <StyledHero>
        <Container position="relative" zIndex="2" mx="0px" px="0px">
          <Flex
            justifyContent="space-between"
            flexDirection={['column', 'column', 'column', 'row']}
            style={{ gap: '4px' }}
          >
            <Box>
              <StyledHeading as="h1" mb={['12px', '12px', '24px']}>
                {t('Initial Dex Offerings')}
              </StyledHeading>
              <FlexGap gap="3px">
                <StyledSubTitle bold>{t('IDO')}</StyledSubTitle>
                <StyledSubTitle>:</StyledSubTitle>
                <StyledSubTitle>{t('Get new tokens launching on Binance Wallet')}</StyledSubTitle>
              </FlexGap>
            </Box>
            {isMobile ? (
              <Text onClick={handleClick} mt="0.375rem" bold color="#02919D" style={{ cursor: 'pointer' }}>
                {t('How does it work?')}
              </Text>
            ) : (
              <DesktopButton onClick={handleClick} variant="subtle">
                {t('How does it work?')}
              </DesktopButton>
            )}
          </Flex>
        </Container>
      </StyledHero>
    </Box>
  )
}

export default Hero
