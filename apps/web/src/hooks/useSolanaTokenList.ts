import { useEffect, useState } from 'react'

import type { TokenInfo } from '@pancakeswap/solana-core-sdk'

const PCS_TOKEN_LIST_URL = 'https://tokens.pancakeswap.finance/pancakeswap-solana-default.json'
const RAYDIUM_TOKEN_LIST_URL = 'https://api-v3.raydium.io/mint/list'
const JUPITER_TOKEN_LIST_URL = 'https://lite-api.jup.ag/tokens/v1/tagged/verified'

const USER_ADDED_KEY = 'solana-user-added-tokens'

function getUserAddedTokens(): TokenInfo[] {
  try {
    return JSON.parse(localStorage.getItem(USER_ADDED_KEY) || '[]')
  } catch {
    return []
  }
}

function saveUserAddedTokens(tokens: TokenInfo[]) {
  localStorage.setItem(USER_ADDED_KEY, JSON.stringify(tokens))
}

export function useSolanaTokenList() {
  const [tokenList, setTokenList] = useState<TokenInfo[]>([])
  const [userTokens, setUserTokens] = useState<TokenInfo[]>(getUserAddedTokens())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function fetchAll() {
      setLoading(true)
      try {
        // Fetch all lists in parallel
        const [pcsRes, raydiumRes, jupRes] = await Promise.all([
          fetch(PCS_TOKEN_LIST_URL).then((r) => r.json()),
          fetch(RAYDIUM_TOKEN_LIST_URL).then((r) => r.json()),
          fetch(JUPITER_TOKEN_LIST_URL).then((r) => r.json()),
        ])
        // PCS: { tokens: TokenInfo[] }
        // Raydium: { mintList: TokenInfo[], blacklist: string[], whiteList: string[] }
        // Jupiter: TokenInfo[]
        const pcsList: TokenInfo[] = pcsRes.tokens || []
        const raydiumList: TokenInfo[] = raydiumRes.mintList || []
        const blacklist: string[] = raydiumRes.blacklist || []
        const whitelist: string[] = raydiumRes.whiteList || []
        const jupList: TokenInfo[] = Array.isArray(jupRes) ? jupRes : jupRes.tokens || []

        // Merge logic
        const tokenMap = new Map<string, TokenInfo>()
        const addToken = (token: TokenInfo, type: string, priority: number) => {
          if (blacklist.includes(token.address)) return
          if (tokenMap.has(token.address)) return
          tokenMap.set(token.address, { ...token, type, priority })
        }

        // Always add SOL (if present in PCS or Raydium)
        const solToken = pcsList.find((t) => t.symbol === 'SOL') || raydiumList.find((t) => t.symbol === 'SOL')
        if (solToken) addToken(solToken, 'raydium', 2)

        // PCS tokens (priority 3)
        for (const t of pcsList) addToken(t, 'pcs', 3)
        // Raydium tokens (priority 2)
        for (const t of raydiumList) addToken(t, 'raydium', 2)
        // Jupiter tokens (priority 1)
        for (const t of jupList) addToken(t, 'jupiter', 1)
        // User-added tokens (priority 1, type extra)
        for (const t of userTokens) addToken(t, 'extra', 1)

        // Final list
        const merged = Array.from(tokenMap.values())
        if (!cancelled) setTokenList(merged)
      } catch (e) {
        if (!cancelled) setTokenList([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchAll()
    return () => {
      cancelled = true
    }
  }, [userTokens])

  // Add a user token
  const addUserToken = (token: TokenInfo) => {
    setUserTokens((prev) => {
      const next = prev.some((t) => t.address === token.address) ? prev : [...prev, token]
      saveUserAddedTokens(next)
      return next
    })
  }

  // Remove a user token
  const removeUserToken = (address: string) => {
    setUserTokens((prev) => {
      const next = prev.filter((t) => t.address !== address)
      saveUserAddedTokens(next)
      return next
    })
  }

  return { tokenList, loading, addUserToken, removeUserToken }
}
