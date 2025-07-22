import type { NativeCurrency } from './nativeCurrency'
import { SPLToken } from './splToken'
import type { Token } from './token'

export type Currency = NativeCurrency | Token

export type UnifiedNativeCurrency = NativeCurrency | (typeof SPLToken)['SOL']
export type UnifiedCurrency = SPLToken | Currency
export type UnifiedToken = SPLToken | Token
