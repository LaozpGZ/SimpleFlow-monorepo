// bsc testnet

import { ChainId } from '@pancakeswap/chains'

// 0x68e5f51980e2acbb9817e34f3a2db71f5ce2ece3
export const GIFT_PANCAKE_V1_ADDRESS = '0x7E17FcBE255f02848fEE2c856a1Ab56F98E31c9C'

// @ts-ignore
export const NEXT_PUBLIC_GIFT_API = process.env.NEXT_PUBLIC_GIFT_API

export const GIFT_CODE_LENGTH = 20

export const QUERY_KEY_GIFT_INFO = 'gift-info'

export const CHAINS_WITH_GIFT_CLAIM = [ChainId.BSC_TESTNET, ChainId.BSC] as const
