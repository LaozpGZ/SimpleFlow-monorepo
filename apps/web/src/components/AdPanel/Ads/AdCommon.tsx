import { useTranslation } from '@pancakeswap/localization'
import { Link } from '@pancakeswap/uikit'
import { BodyText } from '../BodyText'
import { AdButton } from '../Button'
import { AdCard } from '../Card'
import { AdsConfigs, AdsIds } from '../hooks/adsConfig'
import { AdTextConfig } from '../types'
import { getImageUrl } from '../utils'

export const AdCommon = (props: { id: AdsIds }) => {
  const { t } = useTranslation()
  const config = AdsConfigs[props.id]
  const { img, texts, btn, options } = config.ad

  return (
    <AdCard imageUrl={getImageUrl(img)} imgPadding={options?.imagePadding}>
      <BodyText mb="0">
        {texts.map((textConfig, i) => {
          const key = `${textConfig.text}-${i}`
          return <TextRender key={key} config={textConfig} />
        })}
      </BodyText>
      <AdButton mt="16px" href={btn.link} externalIcon isExternalLink>
        {t(btn.text)}
      </AdButton>
    </AdCard>
  )
}

const TextRender = (props: { config: AdTextConfig }) => {
  const { t } = useTranslation()
  const { config } = props
  if (config.link) {
    return (
      <Link fontSize="inherit" href={config.link} color="secondary" bold>
        {t(config.text)}
      </Link>
    )
  }
  return <>{t(config.text)}</>
}
