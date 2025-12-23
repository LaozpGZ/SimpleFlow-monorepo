import { atomFamily } from 'jotai/utils'
import { useAtomValue } from 'jotai'
import { atomWithLoadable } from 'quoter/atom/atomWithLoadable'
import { AdSlide, RemoteAds } from '../ads.types'
import { JsonAds } from '../Ads/JsonAds'

export const jsonAdsConfigAtom = atomFamily((url: string) => {
  return atomWithLoadable<RemoteAds[]>(async () => {
    if (!url) return []
    const res = await fetch(url)
    const json = await res.json()
    return json as RemoteAds[]
  })
})

export const useJsonAdsConfig = (url: string): AdSlide[] => {
  const loadable = useAtomValue(jsonAdsConfigAtom(url))
  const jsonAds = loadable.unwrapOr([])

  const now = Date.now()

  return jsonAds
    .filter((config) => {
      if (config.startTime && config.endTime) {
        const start = Date.parse(config.startTime)
        const end = Date.parse(config.endTime)

        if (!Number.isNaN(start)) {
          if (now < start) return false
        }
        if (!Number.isNaN(end)) {
          if (now > end) return false
        }
      }

      // Filter out specific ads
      const blockedTexts = ['Trade Tokenized Assets', 'Zero-Fee Predictions', 'probable.markets']
      const hasBlockedText = config.texts?.some((text) => {
        if (typeof text === 'string') return blockedTexts.some((blocked) => text.includes(blocked))
        if (typeof text === 'object' && 'i18nText' in text) {
          const i18n = text.i18nText
          if (typeof i18n === 'string') return blockedTexts.some((blocked) => i18n.includes(blocked))
          return blockedTexts.some((blocked) => i18n.mobile?.includes(blocked) || i18n.desktop?.includes(blocked))
        }
        return false
      })
      if (hasBlockedText) return false

      return true
    })
    .map((config) => ({
      id: config.id,
      component: <JsonAds ad={config} />,
      priority: config.priority,
    }))
}

export default useJsonAdsConfig
