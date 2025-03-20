import { ConfigType } from './FAQ/types'

export const commonLayoutWhitelistedPages = ['/swap', '/buy-crypto', '/prediction']

export const pageToFaqTypeMap: Record<string, ConfigType> = {
  [commonLayoutWhitelistedPages[0]]: 'swap',
  [commonLayoutWhitelistedPages[1]]: 'prediction',
  [commonLayoutWhitelistedPages[2]]: 'buyCrypto',
}
