import { HomePageData } from './types'

const isString = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0
const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)
const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean'
const isNonEmptyArray = <T>(value: unknown): value is T[] => Array.isArray(value) && value.length > 0

type Token = HomePageData['tokens'][number]
type TokenBase = HomePageData['pools'][number]['token0']
type Pool = HomePageData['pools'][number]
type Currency = HomePageData['currencies'][number]
type Chain = HomePageData['chains'][number]
type Partner = HomePageData['partners'][number]
type User = HomePageData['topWinner']
type Stats = HomePageData['stats']

const isTokenBaseValid = (token: unknown): token is TokenBase => {
  if (!token || typeof token !== 'object') {
    return false
  }
  const candidate = token as TokenBase
  return (
    isString(candidate.id) &&
    isString(candidate.symbol) &&
    typeof candidate.chainId === 'number' &&
    isString(candidate.icon)
  )
}

const isTokenValid = (token: unknown): token is Token => {
  if (!isTokenBaseValid(token)) {
    return false
  }
  const candidate = token as Token
  return isNumber(candidate.price) && isNumber(candidate.percent)
}

const isPoolValid = (pool: unknown): pool is Pool => {
  if (!pool || typeof pool !== 'object') {
    return false
  }
  const candidate = pool as Pool
  return (
    isString(candidate.id) &&
    isTokenBaseValid(candidate.token0) &&
    isTokenBaseValid(candidate.token1) &&
    typeof candidate.chainId === 'number' &&
    isNumber(candidate.apr24h) &&
    isString(candidate.protocol) &&
    isString(candidate.link)
  )
}

const isCurrencyValid = (currency: unknown): currency is Currency => {
  if (!currency || typeof currency !== 'object') {
    return false
  }
  const candidate = currency as Currency
  return isString(candidate.symbol) && isString(candidate.logo)
}

const isChainValid = (chain: unknown): chain is Chain => {
  if (!chain || typeof chain !== 'object') {
    return false
  }
  const candidate = chain as Chain
  return isString(candidate.logo) && isString(candidate.logoM) && isString(candidate.logoL)
}

const isPartnerValid = (partner: unknown): partner is Partner => {
  if (!partner || typeof partner !== 'object') {
    return false
  }
  const candidate = partner as Partner
  return isString(candidate.logo) && isString(candidate.link) && isString(candidate.name)
}

const isStatsValid = (stats: unknown): stats is Stats => {
  if (!stats || typeof stats !== 'object') {
    return false
  }
  const candidate = stats as Stats
  return (
    isNumber(candidate.totalUsers) &&
    isNumber(candidate.totalTrades) &&
    isNumber(candidate.totalValueLocked) &&
    isNumber(candidate.community)
  )
}

const isUserValid = (user: unknown): user is User => {
  if (!user || typeof user !== 'object') {
    return false
  }
  const candidate = user as User
  return typeof candidate.user === 'object' && candidate.user !== null && isBoolean(candidate.hasRegistered)
}

export const isHomePageDataValid = (data: unknown): data is HomePageData => {
  if (!data || typeof data !== 'object') {
    return false
  }
  const candidate = data as HomePageData
  return (
    isNonEmptyArray<Token>(candidate.tokens) &&
    candidate.tokens.every(isTokenValid) &&
    isNonEmptyArray<Pool>(candidate.pools) &&
    candidate.pools.every(isPoolValid) &&
    isNonEmptyArray<Currency>(candidate.currencies) &&
    candidate.currencies.every(isCurrencyValid) &&
    isNonEmptyArray<Chain>(candidate.chains) &&
    candidate.chains.every(isChainValid) &&
    isStatsValid(candidate.stats) &&
    isNonEmptyArray<Partner>(candidate.partners) &&
    candidate.partners.every(isPartnerValid) &&
    isUserValid(candidate.topWinner)
  )
}
