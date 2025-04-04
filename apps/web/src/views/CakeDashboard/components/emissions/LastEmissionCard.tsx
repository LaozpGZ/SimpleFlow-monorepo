import { useTranslation } from '@pancakeswap/localization'
import { CardProps, FlexGap, ScanLink, Text } from '@pancakeswap/uikit'
import { StatsCard, StatsCardHeader } from '../StatsCard'

export const LastEmissionCard = (props: CardProps) => {
  const { t } = useTranslation()

  return (
    <StatsCard {...props}>
      <FlexGap justifyContent="space-between" alignItems="center">
        <StatsCardHeader>{t('Last Emission')}</StatsCardHeader>

        <ScanLink href="https://bscscan.com/tx/0x00" color="primary60" fontSize="14px" useBscCoinFallback>
          a123s5re...
        </ScanLink>
      </FlexGap>

      <Text fontSize="24px" bold>
        9.3m CAKE
      </Text>

      <Text fontSize="14px" color="textSubtle">
        2.037% of max supply
      </Text>
    </StatsCard>
  )
}
