import translations from './config/translations.json'

export type ContextData = {
  [key: string]: string | number | undefined
}

export interface ProviderState {
  isFetching: boolean
  currentLanguage: Language
}

export interface ContextApi extends ProviderState {
  setLanguage: (language: Language) => void
  t: TranslateFunction
}

// To support string literals and union of string
// https://stackoverflow.com/questions/61047551/typescript-union-of-string-and-string-literals
type MaybeObject = Record<never, never>
export type TranslationKey = keyof typeof translations | (string & MaybeObject)

export type TranslateFunction = (key: TranslationKey, data?: ContextData) => string

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

export interface Language {
  code: LanguageCode
  language: string
  locale: string
}
