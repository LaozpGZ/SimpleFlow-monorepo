import { useTranslation } from '@pancakeswap/localization'
import { BscScanIcon, CardBody, FlexGap, LanguageIcon, Text } from '@pancakeswap/uikit'
import useTheme from 'hooks/useTheme'

export const Footer: React.FC<{ tokenSymbol?: string }> = ({ tokenSymbol }) => {
  const { theme } = useTheme()
  const { t } = useTranslation()
  return (
    <CardBody>
      <FlexGap gap="12px" flexDirection="column">
        <FlexGap gap="12px">
          <LanguageIcon width="24px" color={theme.colors.textSubtle} />
          <BscScanIcon width="24px" color={theme.colors.textSubtle} />
        </FlexGap>
        <Text color="textSubtle" fontSize="14px" lineHeight="16.8px">
          {tokenSymbol}{' '}
          {t(
            'is a new DeFi platform that lorem ispum here is a brief introduction to the IDO token projects and above shows links to project websites',
          )}
        </Text>
      </FlexGap>
    </CardBody>
  )
}
