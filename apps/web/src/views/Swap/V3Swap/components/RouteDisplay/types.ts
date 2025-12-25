import { Route } from '@simpleflow/smart-router'
import { Currency } from '@simpleflow/swap-sdk-core'

export type RouteDisplayEssentials = Pick<Route, 'path' | 'pools' | 'inputAmount' | 'outputAmount' | 'percent' | 'type'>

export type Pair = [Currency, Currency]
