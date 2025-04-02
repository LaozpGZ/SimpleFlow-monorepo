import { useTranslation } from '@pancakeswap/localization'
import { CardProps, FlexGap, LogoRoundIcon, Text } from '@pancakeswap/uikit'
import { StatsCard, StatsCardHeader } from '../StatsCard'

export const CakeHoldersCard = (props: CardProps) => {
  const { t } = useTranslation()

  return (
    <StatsCard {...props}>
      <FlexGap gap="8px" alignItems="center">
        <LogoRoundIcon />
        <StatsCardHeader>{t('CAKE Holders')}</StatsCardHeader>
      </FlexGap>
      <Text fontSize="24px" bold>
        2M
      </Text>
      <Text color="textSubtle" small>
        {t('Total number of wallets holding CAKE')}
      </Text>
    </StatsCard>
  )
}
