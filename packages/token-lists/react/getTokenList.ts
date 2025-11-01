/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
import uriToHttp from '@pancakeswap/utils/uriToHttp'
import schema from '../schema/pancakeswap.json'
import { TokenInfo, TokenList } from '../src/types'

/**
 * Contains the logic for resolving a list URL to a validated token list
 * @param listUrl list url
 */
export async function getTokenList(listUrl: string): Promise<TokenList | undefined> {
  const urls: string[] = uriToHttp(listUrl)
  const { default: Ajv } = await import('ajv')
  const validator = new Ajv({ allErrors: true }).compile(schema)

  for (const [i, url] of urls.entries()) {
    try {
      const json = await fetchJson(url)
      if (!validator(json)) {
        const invalidIndices = new Set<number>()
        const preFilterValidationErrors =
          validator.errors
            ?.map((error) => {
              const dataPath = (error as any)?.instancePath || (error as any)?.dataPath || ''
              const match = dataPath.match(/\/tokens\/(\d+)/) || dataPath.match(/\.tokens\[(\d+)\]/)
              if (match) invalidIndices.add(parseInt(match[1], 10))
              return `• ${dataPath} ${error.message ?? ''}`
            })
            .join('\n') ?? 'unknown error'

        let isValid = false

        if (Array.isArray(json.tokens)) {
          const filteredTokens = json.tokens.filter((_: TokenInfo, index: number) => !invalidIndices.has(index))
          const testJson = { ...json, tokens: filteredTokens }

          if (validator(testJson)) {
            json.tokens = filteredTokens
            isValid = true
          }
        }

        if (!isValid) {
          const validationErrors =
            validator.errors
              ?.map((error) => {
                const dataPath = (error as any).instancePath || (error as any).dataPath || ''
                return `• ${dataPath} ${error.message ?? ''}`
              })
              .join('\n') ?? 'unknown error'

          throw new Error(`Token list ${url} failed validation: ${validationErrors}`)
        } else {
          console.warn(`Token list ${url} validation failed before token filtering: ${preFilterValidationErrors}`)
        }
      }
      return json as TokenList
    } catch (error) {
      // if (i === urls.length - 1) {
      // throw new Error(`Failed to download list ${listUrl}`)
      // }
      console.error(`Failed to download or validate list from ${url}:`, error)

      return undefined
    }
  }
  throw new Error('Unrecognized list URL protocol.')
}

async function fetchJson(url: string): Promise<any> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch: ${url}`)
  return res.json()
}
