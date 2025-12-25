const docLangCodeMapping: Record<string, string> = {
  it: 'italian',
  ja: 'japanese',
  fr: 'french',
  vi: 'vietnamese',
  id: 'indonesian',
  'zh-cn': 'chinese',
  'pt-br': 'portuguese-brazilian',
}

export const getDocLink = (code: string) =>
  docLangCodeMapping[code]
    ? `https://docs.simpleflow.finance/v/${docLangCodeMapping[code]}/get-started/connection-guide`
    : `https://docs.simpleflow.finance/get-started/connection-guide`
