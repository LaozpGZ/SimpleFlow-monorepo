import { useTranslation } from '@pancakeswap/localization'
import { Box, Button, FlexGap, LinkExternal, Text } from '@pancakeswap/uikit'
import useTheme from 'hooks/useTheme'
import { styled } from 'styled-components'
import { getImageUrl } from './utils'

const InfoSectionWrapper = styled.div`
  position: relative;
  background: ${({ theme }) => theme.colors.background};
  min-height: 657px;

  ${({ theme }) => theme.mediaQueries.lg} {
    padding: 160px;
  }
`
const Wrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`

const InnerWrapper = styled.div`
  width: 100%;
  position: relative;
  flex-direction: column;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
`
const walletConfig = [
  { title: 'Trust Wallet', image: 'trust.png' },
  { title: 'SafePal', image: 'safepal.png' },
  { title: 'Coinbase Wallet', image: 'coinbase.png' },
  { title: 'TokenPocket', image: 'token-pocket.png' },
  { title: 'Others', image: 'others.png' },
]

export const InfoSection: React.FC = () => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  return (
    <InfoSectionWrapper>
      <Wrapper>
        <InnerWrapper>
          <Box>
            <Text textAlign="center" fontSize="64px" bold color="secondary" lineHeight="76px">
              126,280
            </Text>
            <Text fontSize="40px" lineHeight="48px" bold>
              {t('Total onboarded addresses')}
            </Text>
          </Box>
          <Text>{t('Having trouble? Choose your wallet to view the detailed guide on how to apply MEV Guard:')}</Text>
          <FlexGap maxWidth="588px" gap="40px">
            {walletConfig.map((wallet) => (
              <FlexGap flexDirection="column" alignItems="center" gap="8px">
                <img src={getImageUrl(wallet.image)} alt={wallet.title} width="64px" />
                <Text fontSize="16px" lineHeight="24px" bold color="#02919D">
                  {t(wallet.title)}
                </Text>
              </FlexGap>
            ))}
          </FlexGap>
          <FlexGap flexDirection="column" gap="24px" justifyContent="center" alignItems="center">
            <Text>{t('or')}</Text>
            <Button endIcon={<LinkExternal color={theme.colors.background} />}>{t('View FAQ docs')}</Button>
          </FlexGap>
        </InnerWrapper>
      </Wrapper>
    </InfoSectionWrapper>
  )
}
