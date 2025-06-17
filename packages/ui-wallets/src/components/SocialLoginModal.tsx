import { useTranslation } from '@pancakeswap/localization'
import { Button, Flex, Heading, ModalV2, ModalWrapper, Text, CloseIcon, IconButton } from '@pancakeswap/uikit'
import { MouseEvent } from 'react'
import styled from 'styled-components'

interface SocialLoginModalProps {
  isOpen: boolean
  onDismiss: () => void
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

const PasskeyButton = styled(SocialLoginButton)`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  box-shadow: 0px 2px 0px 0px ${({ theme }) => (theme.isDark ? '#452a7a' : '#7645D9')};

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryBright};
  }
`

const Web3WalletButton = styled(SocialLoginButton)`
  background-color: ${({ theme }) => theme.colors.tertiary};
  border: none;
  box-shadow: 0px 2px 0px 0px ${({ theme }) => (theme.isDark ? '#383241' : '#D7CAEC')};

  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
  }
`

const SocialLoginModal: React.FC<SocialLoginModalProps> = ({ isOpen, onDismiss }) => {
  const { t } = useTranslation()

  const handleGoogleLogin = () => {
    console.log('Google login clicked')
    // Implement actual Google login logic here
  }

  const handleXLogin = () => {
    console.log('X (Twitter) login clicked')
    // Implement actual X (Twitter) login logic here
  }

  const handleTelegramLogin = () => {
    console.log('Telegram login clicked')
    // Implement actual Telegram login logic here
  }

  const handleDiscordLogin = () => {
    console.log('Discord login clicked')
    // Implement actual Discord login logic here
  }

  const handlePasskeyLogin = () => {
    console.log('Passkey login clicked')
    // Implement actual Passkey login logic here
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
            <img src="https://cdn.pancakeswap.com/wallets/google.svg" width="24" height="24" alt="Google" />
            {t('Continue with Google')}
          </SocialLoginButton>

          <SocialLoginButton onClick={handleXLogin}>
            <img src="https://cdn.pancakeswap.com/wallets/x.svg" width="24" height="24" alt="X (Twitter)" />
            {t('Continue with X')}
          </SocialLoginButton>

          <SocialLoginButton onClick={handleTelegramLogin}>
            <img src="https://cdn.pancakeswap.com/wallets/telegram.svg" width="24" height="24" alt="Telegram" />
            {t('Continue with Telegram')}
          </SocialLoginButton>

          <SocialLoginButton onClick={handleDiscordLogin}>
            <img src="https://cdn.pancakeswap.com/wallets/discord.svg" width="24" height="24" alt="Discord" />
            {t('Continue with Discord')}
          </SocialLoginButton>

          <PasskeyButton onClick={handlePasskeyLogin}>
            <img src="https://cdn.pancakeswap.com/wallets/passkey.svg" width="24" height="24" alt="Passkey" />
            {t('Continue with Passkey')}
          </PasskeyButton>

          <Web3WalletButton onClick={handleWeb3WalletLogin}>
            <img src="https://cdn.pancakeswap.com/wallets/wallet.svg" width="24" height="24" alt="Web3 Wallet" />
            {t('Continue with Web3 Wallet')}
          </Web3WalletButton>
        </StyledModalContainer>
      </StyledModalWrapper>
    </ModalV2>
  )
}

export default SocialLoginModal
