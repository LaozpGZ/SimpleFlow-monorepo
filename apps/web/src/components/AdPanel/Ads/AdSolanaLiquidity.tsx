import { useTranslation } from '@pancakeswap/localization'
import { Text } from '@pancakeswap/uikit'
import { AdPlayerProps } from '@pancakeswap/widgets-internal'
import { ASSET_CDN } from 'config/constants/endpoints'

import { BodyText } from '../BodyText'
import { AdButton } from '../Button'
import { AdCard } from '../Card'

const actionLink = 'https://solana.pancakeswap.finance/liquidity-pools'
const imgURL = `${ASSET_CDN}/solana/promotions/add_liquidity.png`

export const AdSolanaLiquidity = (props: Omit<AdPlayerProps, 'config'>) => {
  const { t } = useTranslation()

  return (
    <AdCard imageUrl={imgURL} {...props}>
      <BodyText mb="0">
        <Text as="span" color="text" bold fontSize="14px">
          {t('Provide Liquidity on Solana PancakeSwap')}
        </Text>
      </BodyText>

      <AdButton mt="32px" href={actionLink} externalIcon isExternalLink>
        {t('Add LP Now')}
      </AdButton>
    </AdCard>
  )
}
