import { useTranslation } from '@pancakeswap/localization'
import { ArrowForwardIcon, Button, FlexGap, Text } from '@pancakeswap/uikit'
import React from 'react'
import { styled } from 'styled-components'

const SocialLoginIconBox = styled.div<{ $bg: string }>`
  position: relative;
  width: 21px;
  height: 21px;
  border-radius: 8px;
  border: 2px solid ${({ theme }) => theme.colors.input};
  &:not(:first-child) {
    margin-left: -15px;
  }
  background-image: ${({ $bg }) => `url(${$bg})`};
  background-size: cover;
  background-position: center center;
  background-color: white;
  padding: 4px;
  overflow: hidden;
`

interface SocialLoginButtonProps {
  onClick: () => void
  assetCdn: string
  style?: React.CSSProperties
}

const SocialLoginButton: React.FC<SocialLoginButtonProps> = ({ onClick, assetCdn, style }) => {
  const { t } = useTranslation()

  // Fixed 4 social icons
  const socialIcons = ['google.jpg', 'telegram.svg', 'discord.svg']

  return (
    <Button variant="light" onClick={onClick} width="100%" style={style}>
      <FlexGap gap="8px" width="100%" justifyContent="center" alignItems="center" padding="12px">
        {socialIcons.map((icon, index) => (
          <SocialLoginIconBox key={index} $bg={`${assetCdn}/web/wallets/social-login/${icon}`} />
        ))}
        <Text fontSize="12px">{t('Connect with social login')}</Text>
        <ArrowForwardIcon color="primary" />
      </FlexGap>
    </Button>
  )
}

export default SocialLoginButton
