/**
 * Extract translation keys from a source string.
 * Matches:
 *  - t("..."), t('...'), t(`...`)
 *  - <Trans>...</Trans>
 *  - <Trans i18nKey="...">...</Trans>
 *  - <SearchInput placeholder="..."/>
 */
export function extractTranslationKeys(str: string): Set<string> {
  const keys = new Set<string>()
  let match: RegExpExecArray | null

  // t("...") / t('...') / t(`...`)
  const regexWithoutCarriageReturn = /\bt\((["'`])((?:\\\1|(?:(?!\1)).)*)(\1)/gm
  const regexWithCarriageReturn = /\bt\([\r\n]\s+(["'`])([^]*?)(\1)/gm

  while ((match = regexWithoutCarriageReturn.exec(str)) !== null) {
    if (match[2].trim()) keys.add(match[2])
  }
  while ((match = regexWithCarriageReturn.exec(str)) !== null) {
    if (match[2].trim()) keys.add(match[2])
  }

  // <SearchInput placeholder="..."/>
  const regexWithSearchInput = /<SearchInput ([^']*?) \/>/gm
  const regexWithSearchInputPlaceHolder = /placeholder="([^']*?)"/gm
  while ((match = regexWithSearchInput.exec(str)) !== null) {
    const placeHolderMatch = regexWithSearchInputPlaceHolder.exec(match[1])
    if (placeHolderMatch?.[1]) keys.add(placeHolderMatch[1])
  }

  // <Trans i18nKey="...">
  const regexWithTransI18nKey = /i18nKey=(["'`])((?:\1|(?:(?!\1)).)*?)\1/gm
  while ((match = regexWithTransI18nKey.exec(str)) !== null) {
    if (match[2].trim()) keys.add(match[2].trim())
  }

  // <Trans i18nTemplate="...">
  const regexWithTransDefaults = /\bi18nTemplate=(["'`])([^]*?)(\1)/gm

  while ((match = regexWithTransDefaults.exec(str)) !== null) {
    const cleaned = match[2].replace(/\n\s+/g, " ")
    if (cleaned.trim()) keys.add(cleaned.trim())
  }

  // <Trans>...</Trans>
  const regexWithTrans = /<Trans>([^$]*?)<\/Trans>/gm
  const regexWithTransCarriage = /<Trans>([\r\n]\s+([^]*?))<\/Trans>/gm
  while ((match = regexWithTrans.exec(str)) !== null) {
    const cleaned = match[1].replace(/\n\s+/g, " ")
    if (cleaned.trim()) keys.add(cleaned.trim())
  }
  while ((match = regexWithTransCarriage.exec(str)) !== null) {
    const cleaned = match[1].replace(/\n\s+/g, " ")
    if (cleaned.trim()) keys.add(cleaned.trim())
  }

  return keys
}
