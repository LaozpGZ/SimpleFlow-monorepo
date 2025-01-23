import { useTranslation } from '@pancakeswap/localization'
import { Box, Container, Flex, Heading, Text } from '@pancakeswap/uikit'
import { useRouter } from 'next/router'
import { styled } from 'styled-components'

const StyledHero = styled(Box)`
  position: relative;
  overflow: hidden;
`

const StyledHeading = styled(Heading)`
  font-size: 2.5rem;
  color: ${({ theme }) => theme.colors.text};
`

const StyledSubTitle = styled(Text)`
  font-size: 16px;
  display: inline;
`

const Hero = () => {
  const router = useRouter()
  const { t } = useTranslation()

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
            flexDirection={['column', 'column', 'column', 'column']}
            style={{ gap: '4px' }}
          >
            <Box>
              <StyledHeading as="h1" mb={['12px', '12px', '12px', '12px']}>
                {t('Exclusive TGE')}
              </StyledHeading>
              <p>
                <StyledSubTitle bold>{t('Token Generation Event')}</StyledSubTitle>
                <StyledSubTitle>: {t('Get new tokens launching on Binance Wallet')}</StyledSubTitle>
              </p>
            </Box>

            <Text onClick={handleClick} mt="0.375rem" bold color="#02919D" style={{ cursor: 'pointer' }}>
              {t('How does it work?')}
            </Text>
          </Flex>
        </Container>
      </StyledHero>
    </Box>
  )
}

export default Hero
