import { Language, LanguageCode, languageList } from '@pancakeswap/localization'
import { LocaleSelector as UIKitLocalSelector } from '@pancakeswap/uikit'

export type LocaleSelectorProps = {
  currentLang?: string
  langs?: Language[] | LanguageCode[]
  setLang?: (lang: Language) => void
}
export const LocaleSelector: React.FC<LocaleSelectorProps> = ({ currentLang, langs: langs_, setLang }) => {
  const langs = langs_?.every((lang) => typeof lang === 'string')
    ? (langs_.map((lang) => languageList.find((l) => l.code === lang)).filter(Boolean) as Language[])
    : (langs_ as Language[])

  return <UIKitLocalSelector currentLang={currentLang} langs={langs} setLang={setLang} />
}
