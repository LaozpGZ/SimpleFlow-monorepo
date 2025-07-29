import { useEffect, useMemo, useState, useCallback } from 'react'

import { useAtomValue, useSetAtom } from 'jotai'
import { solanaTokenListAtom, solanaListSettingsAtom } from 'state/token/solanaTokenAtoms'

import type { TokenInfo } from '@pancakeswap/solana-core-sdk'
import { SPLToken } from '@pancakeswap/swap-sdk-core'
import { useQuery } from '@tanstack/react-query'
import { NonEVMChainId } from '@pancakeswap/chains'
import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token-0.4'

const USER_ADDED_KEY = 'solana-user-added-tokens'

type Parser = (data: any) => SPLToken[]

export enum TokenListKey {
  PANCAKESWAP = 'pancakeswap',
  RAYDIUM = 'raydium',
  JUPITER = 'jupiter',
}
interface SolanaTokenListConfig {
  key: TokenListKey
  name: string
  logoURI: string
  description: string
  apiUrl: string
  parser: Parser
}

const convertRawTokenInfoIntoSPLToken = (token: TokenInfo) => {
  return new SPLToken({
    address: token.address,
    decimals: token.decimals,
    symbol: token.symbol,
    logoURI: token.logoURI,
    name: token.name,
    chainId: NonEVMChainId.SOLANA,
    programId:
      token.programId ??
      (token.tags?.includes('token-2022') ? TOKEN_2022_PROGRAM_ID.toBase58() : TOKEN_PROGRAM_ID.toBase58()),
  })
}

// Enhanced token list configuration with all necessary metadata
export const SOLANA_LISTS_CONFIG: Record<TokenListKey, SolanaTokenListConfig> = {
  [TokenListKey.PANCAKESWAP]: {
    key: TokenListKey.PANCAKESWAP,
    name: 'PancakeSwap',
    logoURI: 'https://pancakeswap.finance/logo.png',
    description: 'PancakeSwap Token List',
    apiUrl: 'https://tokens.pancakeswap.finance/pancakeswap-solana-default.json',
    parser: (data: any) => {
      return (data?.tokens ?? []).map(convertRawTokenInfoIntoSPLToken)
    }, // Default parser for standard token lists
  },
  [TokenListKey.RAYDIUM]: {
    key: TokenListKey.RAYDIUM,
    name: 'Raydium',
    logoURI: 'https://img-v1.raydium.io/icon/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R.png',
    description: 'Raydium Token List',
    apiUrl: 'https://api-v3.raydium.io/mint/list',
    parser: (data: any) => {
      const { tokens: listTokens, blacklist = [] } = data
      const tokens: SPLToken[] = []

      for (const token of listTokens) {
        if (blacklist.includes(token.address)) continue
        tokens.push(convertRawTokenInfoIntoSPLToken(token))
      }

      return tokens
    }, // Special parser for Raydium format
  },
  [TokenListKey.JUPITER]: {
    key: TokenListKey.JUPITER,
    name: 'Jupiter',
    logoURI: 'https://jup.ag/_next/image?url=%2Fsvg%2Fjupiter-logo.png&w=96&q=75',
    description: 'Jupiter Token List',
    apiUrl: 'https://lite-api.jup.ag/tokens/v1/tagged/verified',
    parser: (data: any) => {
      return (data ?? []).map(convertRawTokenInfoIntoSPLToken)
    }, // Special parser for Jupiter format
  },
}

// Filter out PancakeSwap list since it's always enabled
export const SOLANA_LISTS = Object.values(SOLANA_LISTS_CONFIG).filter((list) => list.key !== TokenListKey.PANCAKESWAP)

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
