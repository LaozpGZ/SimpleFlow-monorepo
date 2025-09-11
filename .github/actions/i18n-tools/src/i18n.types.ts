export interface I18nConfig {
  scanDirs: string[]
  exclude?: string[]
  translationDir: string
  languages: string[]
  extendedTranslationFiles?: string[]
  model: string
  requirements?: string[]
  ignores?: string[]
}

export interface TranslationEntry {
  key: string
  value: string
  files?: string[]
  hint?: string
}

export interface TranslationRequest {
  entries: TranslationEntry[]
  lang: string
  requirements?: string[]
  chunkSize?: number
  model: string
  parallel?: number
}

export interface TranslationResult {
  key: string
  raw: string
  lang: string
  translation: string
}

export interface AmbiguityCheckResult {
  key: string
  ambiguous: boolean
  reason?: string
  suggestions?: string[]
  files: string[]
  contexts: string[]
}
