import { Language, languageList, LanguageContext } from '@pancakeswap/localization'
import { LocaleSelector as UIKitLocalSelector } from '@pancakeswap/uikit'
import { useContext, useEffect, useState } from 'react'

export type LanguageCode =
  | 'ar'
  | 'bn'
  | 'en'
  | 'de'
  | 'el'
  | 'es-ES'
  | 'fi'
  | 'fil'
  | 'fr'
  | 'hi'
  | 'hu'
  | 'id'
  | 'it'
  | 'ja'
  | 'ko'
  | 'nl'
  | 'pl'
  | 'pt-br'
  | 'pt-pt'
  | 'ro'
  | 'ru'
  | 'sv'
  | 'ta'
  | 'uk'
  | 'vi'
  | 'zh-cn'
  | 'zh-tw'

export type LocaleSelectorProps = {
  currentLang?: LanguageCode
  langs?: Language[] | LanguageCode[]
  setLang?: (lang: Language) => void
}
export const LocaleSelector: React.FC<LocaleSelectorProps> = ({ currentLang, langs: langs_, setLang }) => {
  const ctx = useContext(LanguageContext)
  const [initialized, setInitialized] = useState(false)
  const langs = langs_?.every((lang) => typeof lang === 'string')
    ? (langs_.map((lang) => languageList.find((l) => l.code === lang)).filter(Boolean) as Language[])
    : (langs_ as Language[])

  useEffect(() => {
    if (initialized) return
    const language = langs.find((lang) => lang.code === currentLang)
    if (!ctx?.isFetching && currentLang && language) {
      ctx?.setLanguage(language)
      setInitialized(true)
    }
  }, [ctx, currentLang, initialized])

  return <UIKitLocalSelector currentLang={currentLang} langs={langs} setLang={setLang} />
}
