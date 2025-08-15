import { useTranslation } from '@pancakeswap/localization'
import { Box, Button, CopyIcon, Text } from '@pancakeswap/uikit'
import { useState } from 'react'
import { styled } from 'styled-components'

interface QRCodeCopyButtonProps {
  account: string
}

const CopyButton = styled(Button)`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => (theme.isDark ? '#372F47' : '#E7E3EB')};
  border-radius: 16px;
  padding: 12px 20px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  height: 48px;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.primary};

    svg,
    span {
      color: white !important;
    }
  }
`

const QRCodeCopyButton: React.FC<QRCodeCopyButtonProps> = ({ account }) => {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(account)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  return (
    <Box width="100%" mt="16px">
      <CopyButton variant="tertiary" onClick={handleCopy}>
        <CopyIcon width="16px" height="16px" color="textSubtle" />
        <Text fontSize="14px" fontWeight="600" color="textSubtle">
          {copied ? t('Copied!') : t('Copy Address')}
        </Text>
      </CopyButton>
    </Box>
  )
}

export default QRCodeCopyButton
