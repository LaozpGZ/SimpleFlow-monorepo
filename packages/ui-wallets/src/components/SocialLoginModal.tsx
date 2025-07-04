import { useTranslation } from '@pancakeswap/localization'
import {
  Button,
  CloseIcon,
  FlexGap as Flex,
  Heading,
  IconButton,
  ModalV2,
  ModalWrapper,
  Text,
} from '@pancakeswap/uikit'
import { MouseEvent } from 'react'
import styled from 'styled-components'

const ASSET_CDN = 'https://assets.pancakeswap.finance'

interface SocialLoginModalProps {
  isOpen: boolean
  onDismiss: () => void
  onGoogleLogin?: () => void
  onXLogin?: () => void
  onTelegramLogin?: () => void
  onDiscordLogin?: () => void
}

const StyledModalWrapper = styled(ModalWrapper)`
  width: 100%;
  max-width: 360px;
  z-index: 1401;
`

const StyledModalContainer = styled(Flex)`
  flex-direction: column;
  padding: 24px;
`

const SocialLoginButton = styled(Button)`
  width: 100%;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 12px 16px;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  box-shadow: 0px 2px 0px 0px ${({ theme }) => theme.colors.cardBorder};

  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
  }

  img {
    margin-right: 12px;
  }
`

const Divider = styled.div`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.cardBorder};
  width: 100%;
`

const Web3WalletButton = styled(SocialLoginButton)`
  background-color: ${({ theme }) => theme.colors.tertiary};
  border: none;
  box-shadow: 0px 2px 0px 0px ${({ theme }) => (theme.isDark ? '#383241' : '#D7CAEC')};

  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
  }
`

const SocialLoginModal: React.FC<SocialLoginModalProps> = ({
  isOpen,
  onDismiss,
  onGoogleLogin,
  onXLogin,
  onTelegramLogin,
  onDiscordLogin,
}) => {
  const { t } = useTranslation()

  const handleGoogleLogin = () => {
    console.log('Google login clicked')
    onGoogleLogin?.()
  }

  const handleXLogin = () => {
    console.log('X (Twitter) login clicked')
    onXLogin?.()
  }

  const handleTelegramLogin = () => {
    console.log('Telegram login clicked')
    onTelegramLogin?.()
  }

  const handleDiscordLogin = () => {
    console.log('Discord login clicked')
    onDiscordLogin?.()
  }

  const handleWeb3WalletLogin = () => {
    console.log('Web3 wallet login clicked')
    onDismiss()
    // Return to wallet selection
  }

  return (
    <ModalV2 isOpen={isOpen} onDismiss={onDismiss} closeOnOverlayClick>
      <StyledModalWrapper onDismiss={onDismiss}>
        <StyledModalContainer>
          <Flex justifyContent="space-between" alignItems="center" mb="24px">
            <Heading as="h3">{t('Social Login')}</Heading>
            <IconButton
              variant="text"
              onClick={(e: MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation()
                onDismiss()
              }}
              aria-label="Close the dialog"
            >
              <CloseIcon color="textSubtle" />
            </IconButton>
          </Flex>

          <Text color="textSubtle" mb="24px">
            {t('Connect with your social account for a seamless experience')}
          </Text>

          <SocialLoginButton onClick={handleGoogleLogin}>
            <img src={`${ASSET_CDN}/web/wallets/social-login/google.jpg`} width="24" height="24" alt="Google" />
            {t('Continue with Google')}
          </SocialLoginButton>

          <Flex>
            <SocialLoginButton onClick={handleXLogin}>
              <img src={`${ASSET_CDN}/web/wallets/social-login/x.svg`} width="24" height="24" alt="X (Twitter)" />
              {t('Continue with X')}
            </SocialLoginButton>

            <SocialLoginButton onClick={handleTelegramLogin}>
              <img src={`${ASSET_CDN}/web/wallets/social-login/telegram.svg`} width="24" height="24" alt="Telegram" />
              {t('Continue with Telegram')}
            </SocialLoginButton>

            <SocialLoginButton onClick={handleDiscordLogin}>
              <img src={`${ASSET_CDN}/web/wallets/social-login/discord.svg`} width="24" height="24" alt="Discord" />
              {t('Continue with Discord')}
            </SocialLoginButton>
          </Flex>

          <Divider />

          <Web3WalletButton onClick={handleWeb3WalletLogin}>{t('Continue with Web3 Wallet')}</Web3WalletButton>
        </StyledModalContainer>
      </StyledModalWrapper>
    </ModalV2>
  )
}

export default SocialLoginModal
