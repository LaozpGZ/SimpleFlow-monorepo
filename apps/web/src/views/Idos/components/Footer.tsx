import { useTranslation } from '@pancakeswap/localization'
import { BscScanIcon, CardBody, FlexGap, LanguageIcon, Link, Text } from '@pancakeswap/uikit'
import { useIDOContract } from 'hooks/useContract'
import useTheme from 'hooks/useTheme'

export const Footer: React.FC = () => {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const idoContract = useIDOContract()
  return (
    <CardBody>
      <FlexGap gap="12px" flexDirection="column">
        <FlexGap gap="12px">
          <Link href="https://myshell.ai" target="_blank" rel="noopener noreferrer">
            <LanguageIcon width="24px" color={theme.colors.textSubtle} />
          </Link>
          <Link href={`https://bscscan.com/address/${idoContract?.address}`} target="_blank" rel="noopener noreferrer">
            <BscScanIcon width="24px" color={theme.colors.textSubtle} />
          </Link>
        </FlexGap>
        <Text color="textSubtle" fontSize="14px" lineHeight="16.8px">
          {t(
            'MyShell is an AI creator platform for everyone to build, share, and own AI agents. Our vision is to create a unified platform that provides product-driven value for web2 users and offers the crypto community participating ownership in practical AI applications, bridging the gap between frontier AI applications and blockchain technology.',
          )}
        </Text>
      </FlexGap>
    </CardBody>
  )
}
