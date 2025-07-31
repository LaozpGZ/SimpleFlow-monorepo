import { Language } from '@pancakeswap/localization'
import { LocaleSelector as UIKitLocalSelector } from '@pancakeswap/uikit'

export type LocaleSelectorProps = {
  currentLang?: string
  langs?: Language[]
  setLang?: (lang: Language) => void
}
export const LocaleSelector: React.FC<LocaleSelectorProps> = UIKitLocalSelector
