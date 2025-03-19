import { useTranslation } from '@pancakeswap/localization'
import { Link, useMatchBreakpoints } from '@pancakeswap/uikit'
import { BodyText } from '../BodyText'
import { AdButton } from '../Button'
import { AdCard } from '../Card'

import { tradingCompetitionConfig } from '../InfoStripes/TradingCompetition'
import { AdPlayerProps } from '../types'
import { getImageUrl } from '../utils'

export const AdTradingCompetition = (props: AdPlayerProps & { token: 'eos' }) => {
  const { t } = useTranslation()
  const { isMobile } = useMatchBreakpoints()
  const { token, ...rest } = props
  const { unit, reward } = tradingCompetitionConfig[token]

  return (
    <AdCard imageUrl={getImageUrl(tradingCompetitionConfig[token].imgUrl)} {...rest}>
      <BodyText mb="0">
        {isMobile
          ? t('Swap %token% to win a share of', { token: token.toUpperCase() })
          : t('Join %token% Trading Competition to share of', { token: token.toUpperCase() })}{' '}
        {unit === '$' ? `$${reward}` : `${reward} ${unit}`}.{' '}
        <Link
          style={{ display: 'inline' }}
          fontSize="inherit"
          href={tradingCompetitionConfig[token].swapUrl}
          color="secondary"
          bold
        >
          {t('Swap Now')}
        </Link>
      </BodyText>
      <AdButton mt="16px" href={tradingCompetitionConfig[token].learnMoreUrl} externalIcon isExternalLink>
        {t('Learn More')}
      </AdButton>
    </AdCard>
  )
}

export const AdTradingCompetitionEos = (props: AdPlayerProps) => {
  return <AdTradingCompetition token="eos" {...props} />
}
