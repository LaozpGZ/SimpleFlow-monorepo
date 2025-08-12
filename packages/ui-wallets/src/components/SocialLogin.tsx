import { useTranslation } from '@pancakeswap/localization'
import {
  AtomBox,
  Button,
  FlexGap as Flex,
  SocialLoginDiscordIcon,
  SocialLoginTelegramIcon,
  SocialLoginXIcon,
  Text,
} from '@pancakeswap/uikit'
import styled from 'styled-components'
import { ASSET_CDN } from '../config/url'

interface SocialLoginProps {
  onGoogleLogin?: () => void
  onXLogin?: () => void
  onTelegramLogin?: () => void
  onDiscordLogin?: () => void
}

const SocialLoginButton = styled(Button)`
  width: 100%;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 12px;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  box-shadow: 0px 2px 0px 0px ${({ theme }) => theme.colors.cardBorder};
  gap: 4px;
`

const SocialLoginButtonVertical = styled(SocialLoginButton)`
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 12px;
  min-height: 100px;
`

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  width: 32px;
  margin-bottom: 4px;
  svg {
    width: 32px;
    height: 32px;
  }
`

const NoticeCard = styled.div`
  background-color: ${({ theme }) => theme.colors.cardSecondary};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 16px;
  padding: 12px;
  margin-bottom: 16px;

  display: flex;
  flex-direction: column;
  align-items: center;
`

const SocialLogin: React.FC<SocialLoginProps> = ({ onGoogleLogin, onXLogin, onTelegramLogin, onDiscordLogin }) => {
  const { t } = useTranslation()

  const handleGoogleLogin = () => {
    onGoogleLogin?.()
  }

  const handleXLogin = () => {
    onXLogin?.()
  }

  const handleTelegramLogin = () => {
    onTelegramLogin?.()
  }

  const handleDiscordLogin = () => {
    onDiscordLogin?.()
  }

  return (
    <AtomBox width="100%">
      <SocialLoginButton onClick={handleGoogleLogin}>
        <img
          src={`${ASSET_CDN}/web/wallets/social-login/google.jpg`}
          width="32"
          height="32"
          alt="Google"
          style={{ borderRadius: '8px' }}
        />
        <Text>{t('Continue with Google')}</Text>
      </SocialLoginButton>

      <Flex gap="8px">
        <SocialLoginButtonVertical onClick={handleXLogin}>
          <IconWrapper>
            <SocialLoginXIcon />
          </IconWrapper>
          <Text>{t('X Login')}</Text>
        </SocialLoginButtonVertical>

        <SocialLoginButtonVertical onClick={handleTelegramLogin}>
          <IconWrapper>
            <SocialLoginTelegramIcon />
          </IconWrapper>
          <Text>{t('Telegram')}</Text>
        </SocialLoginButtonVertical>

        <SocialLoginButtonVertical onClick={handleDiscordLogin}>
          <IconWrapper>
            <SocialLoginDiscordIcon />
          </IconWrapper>
          <Text>{t('Discord')}</Text>
        </SocialLoginButtonVertical>
      </Flex>

      <NoticeCard>
        <Text fontSize="12px">{t('Social login is available for EVM networks.')}</Text>
        <Text fontSize="12px" color="textSubtle">
          {t('For Solana, please use a compatible wallet.')}
        </Text>
        <Button variant="text" scale="xs" mt="8px">
          {t('I have a passkey')}
        </Button>
      </NoticeCard>
    </AtomBox>
  )
}

export default SocialLogin
