import { useTranslation } from '@simpleflow/l10n'
import { Link, Text, useMatchBreakpoints } from '@simpleflow/uikit'
import { AdPlayerProps } from '@simpleflow/widgets-internal'
import { ASSET_CDN } from 'config/constants/endpoints'

import { BodyText } from '../BodyText'
import { AdButton } from '../Button'
import { AdCard } from '../Card'

const learnMoreLink = 'https://blog.simpleflow.finance/articles/expanding-solana-s-accessibility'
const actionLink = process.env.SOLANA_SWAP_PAGE ?? 'https://solana.simpleflow.finance/swap'
const imgURL = `${ASSET_CDN}/solana/promotions/img_swap.png`

export const AdSolana = (props: Omit<AdPlayerProps, 'config'>) => {
  const { t } = useTranslation()
  const { isMobile } = useMatchBreakpoints()

  return (
    <AdCard imageUrl={imgURL} {...props}>
      <BodyText mb="0">
        <Text as="span" color="text" bold fontSize="14px">
          {t('Swap Solana Tokens on PancakeSwap.')}
        </Text>
      </BodyText>

      <Link style={!isMobile ? { display: 'inline' } : {}} fontSize="14px" href={actionLink}>
        {t('Swap Now')}
      </Link>

      <AdButton mt="16px" href={learnMoreLink} externalIcon isExternalLink>
        {t('Learn More')}
      </AdButton>
    </AdCard>
  )
}
