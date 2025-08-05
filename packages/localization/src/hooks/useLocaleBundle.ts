import { useCallback, useEffect, useState } from 'react'
import { fetchLocale, getLanguageCodeFromLS } from '../helpers'
import full from '../config/translations.json'
import i18n from '../i18n'

export const useLocaleBundle = () => {
  const [state, setState] = useState<{
    bundle: Record<string, string>
    ver: number
  }>({
    bundle: full,
    ver: 0,
  })
  const lang = getLanguageCodeFromLS()
  const switchBundle = useCallback(
    async (lang: string) => {
      if (!i18n.hasResourceBundle(lang, 'translation')) {
        const localeData = await fetchLocale(lang)
        if (localeData) {
          i18n.addResourceBundle(lang, 'translation', localeData, true, true)
          setState((prev) => ({
            bundle: localeData,
            ver: prev.ver + 1,
          }))
          return
        }
      }
      setState({
        bundle: i18n.getResourceBundle(lang, 'translation') || full,
        ver: state.ver + 1,
      })
    },
    [state],
  )

  useEffect(() => {
    switchBundle(lang)
  }, [lang, switchBundle])

  const { bundle, ver } = state
  return { lang, bundle, ver, refresh: () => setState((p) => ({ ...p, ver: p.ver + 1 })) }
}
