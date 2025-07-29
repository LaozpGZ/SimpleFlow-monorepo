import { useEffect, useMemo, useState, useCallback } from 'react'

import { useAtomValue, useSetAtom } from 'jotai'
import { solanaTokenListAtom, solanaListSettingsAtom } from 'state/token/solanaTokenAtoms'

import type { TokenInfo } from '@pancakeswap/solana-core-sdk'

import { useQuery } from '@tanstack/react-query'
import {
  SOLANA_LISTS_CONFIG,
  TokenListKey,
  SolanaTokenListConfig,
  USER_ADDED_KEY,
  convertRawTokenInfoIntoSPLToken,
} from 'config/solana-list'

// Custom hook for individual token list queries
function useTokenListQuery(listConfig: SolanaTokenListConfig, isEnabled: boolean) {
  return useQuery({
    queryKey: ['solana-token-list', listConfig.key],
    queryFn: async () => {
      const res = await fetch(listConfig.apiUrl)
      if (!res.ok) {
        throw new Error(`${listConfig.name} list fetch failed`)
      }

      return res.json()
    },
    retry: 3,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: isEnabled,
    select: (data) => {
      return listConfig.parser(data)
    },
  })
}

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
  const setTokenList = useSetAtom(solanaTokenListAtom)
  const listSettings = useAtomValue(solanaListSettingsAtom)

  // Create individual queries for each token list using the custom hook
  const { data: pcsTokens, isLoading: pcsLoading } = useTokenListQuery(
    SOLANA_LISTS_CONFIG[TokenListKey.PANCAKESWAP],
    true,
  ) // Always enabled
  const { data: raydiumTokens, isLoading: raydiumLoading } = useTokenListQuery(
    SOLANA_LISTS_CONFIG[TokenListKey.RAYDIUM],
    listSettings.raydium,
  )
  const { data: jupiterTokens, isLoading: jupiterLoading } = useTokenListQuery(
    SOLANA_LISTS_CONFIG[TokenListKey.JUPITER],
    listSettings.jupiter,
  )

  const mergedTokens = useMemo(() => {
    // TODO: avoid duplicates when merging
    const userSPLTokens = userTokens.map(convertRawTokenInfoIntoSPLToken)

    return [...(pcsTokens ?? []), ...(raydiumTokens ?? []), ...(jupiterTokens ?? []), ...userSPLTokens]
  }, [pcsTokens, raydiumTokens, jupiterTokens, userTokens])

  useEffect(() => {
    setTokenList(mergedTokens)
  }, [mergedTokens, setTokenList])

  // Loading state: true if any enabled query is still loading
  const loading = useMemo(() => {
    return pcsLoading || (listSettings.raydium && raydiumLoading) || (listSettings.jupiter && jupiterLoading)
  }, [pcsLoading, raydiumLoading, jupiterLoading, listSettings])

  // Add a user token and persist
  const addUserToken = useCallback((token: TokenInfo) => {
    setUserTokens((prev) => {
      const next = prev.some((t) => t.address === token.address) ? prev : [...prev, token]
      saveUserAddedTokens(next)
      return next
    })
  }, [])

  // Remove a user token and persist
  const removeUserToken = useCallback((address: string) => {
    setUserTokens((prev) => {
      const next = prev.filter((t) => t.address !== address)
      saveUserAddedTokens(next)
      return next
    })
  }, [])

  const tokenCountsByList = useMemo(() => {
    return {
      [TokenListKey.PANCAKESWAP]: pcsTokens?.length ?? 0,
      [TokenListKey.RAYDIUM]: raydiumTokens?.length ?? 0,
      [TokenListKey.JUPITER]: jupiterTokens?.length ?? 0,
    }
  }, [pcsTokens, raydiumTokens, jupiterTokens])

  return useMemo(
    () => ({ tokenList: mergedTokens, loading, addUserToken, removeUserToken, tokenCountsByList }),
    [mergedTokens, loading, addUserToken, removeUserToken, tokenCountsByList],
  )
}
