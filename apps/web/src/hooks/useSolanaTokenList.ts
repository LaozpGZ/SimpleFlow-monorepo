import type { TokenInfo } from '@pancakeswap/solana-core-sdk'
import { SPLToken } from '@pancakeswap/swap-sdk-core'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

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
  const [userTokens, setUserTokens] = useState<TokenInfo[]>(getUserAddedTokens())

  // PCS
  const pcsQuery = useQuery({
    queryKey: ['solana-pcs-list'],
    queryFn: async () => {
      const res = await fetch(PCS_TOKEN_LIST_URL)
      if (!res.ok) throw new Error('PCS list fetch failed')
      const tokens = (await res.json()).tokens as TokenInfo[]
      return tokens ?? []
    },
    retry: 3,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  // Raydium
  const raydiumQuery = useQuery({
    queryKey: ['solana-raydium-list'],
    queryFn: async () => {
      const res = await fetch(RAYDIUM_TOKEN_LIST_URL)
      if (!res.ok) throw new Error('Raydium list fetch failed')
      const { data } = await res.json()
      return {
        tokens: (data.mintList ?? []) as TokenInfo[],
        blacklist: (data.blacklist ?? []) as string[],
        whitelist: (data.whiteList ?? []) as string[],
      }
    },
    retry: 3,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  // Jupiter
  const jupiterQuery = useQuery({
    queryKey: ['solana-jupiter-list'],
    queryFn: async () => {
      const res = await fetch(JUPITER_TOKEN_LIST_URL)
      if (!res.ok) throw new Error('Jupiter list fetch failed')
      const data = await res.json()
      return Array.isArray(data) ? (data as TokenInfo[]) : (data.tokens as TokenInfo[])
    },
    retry: 3,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  // Merge tokens as soon as any list is available
  const tokenList = useMemo(() => {
    const tokenMap = new Map<string, SPLToken>()
    const addToken = (token: TokenInfo, type: string, priority: number, blacklist: string[] = []) => {
      if (blacklist.includes(token.address)) return
      if (tokenMap.has(token.address)) return
      tokenMap.set(token.address, new SPLToken(token))
    }

    // Raydium tokens (with blacklist/whitelist)
    if (raydiumQuery.data) {
      for (const t of raydiumQuery.data.tokens) addToken(t, 'raydium', 2, raydiumQuery.data.blacklist)
      // Always add SOL if present
      const solToken = raydiumQuery.data.tokens.find((t) => t.symbol === 'SOL')
      if (solToken) addToken(solToken, 'raydium', 2, raydiumQuery.data.blacklist)
    }

    // PCS tokens
    if (pcsQuery.data) for (const t of pcsQuery.data) addToken(t, 'pcs', 3)

    // Jupiter tokens
    if (jupiterQuery.data) for (const t of jupiterQuery.data) addToken(t, 'jupiter', 1)

    // User-added tokens
    for (const t of userTokens) addToken(t, 'extra', 1)

    return Array.from(tokenMap.values())
  }, [pcsQuery.data, raydiumQuery.data, jupiterQuery.data, userTokens])

  // Loading state: true if all queries are still loading
  const loading = pcsQuery.isLoading && raydiumQuery.isLoading && jupiterQuery.isLoading

  // Add/remove user tokens as before
  const addUserToken = (token: TokenInfo) => {
    setUserTokens((prev) => {
      const next = prev.some((t) => t.address === token.address) ? prev : [...prev, token]
      saveUserAddedTokens(next)
      return next
    })
  }
  const removeUserToken = (address: string) => {
    setUserTokens((prev) => {
      const next = prev.filter((t) => t.address !== address)
      saveUserAddedTokens(next)
      return next
    })
  }

  return { tokenList, loading, addUserToken, removeUserToken }
}
