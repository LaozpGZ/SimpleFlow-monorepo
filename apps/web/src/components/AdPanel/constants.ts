// 存放共享的常量，避免循環依賴
import { ConfigType } from './FAQ/types'

export const commonLayoutWhitelistedPages = ['/swap', '/buy-crypto', '/prediction']

// 其他常量也可以放在這裡
export const pageToFaqTypeMap: Record<string, ConfigType> = {
  [commonLayoutWhitelistedPages[0]]: 'swap',
  [commonLayoutWhitelistedPages[1]]: 'prediction',
  [commonLayoutWhitelistedPages[2]]: 'buyCrypto',
}
