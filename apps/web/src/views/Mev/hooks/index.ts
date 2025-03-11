import { ChainId } from '@pancakeswap/chains'
import { useQuery } from '@tanstack/react-query'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { useCallback, useEffect } from 'react'
import { MethodNotFoundRpcError, WalletClient } from 'viem'

import { BSCMevGuardChain } from 'utils/mevGuardChains'

import { addChain } from 'viem/actions'
import { WalletType } from 'views/Mev/types'
import { Connector, useAccount, useWalletClient } from 'wagmi'
import {
  walletPretendToMetamask,
  walletSupportCustomRPCNative,
  walletSupportDefaultMevOnBSC,
  walletSupportManualRPCConfig,
  walletConnectSupportDefaultMevOnBSC,
} from '../constant'

const WalletProviders = [
  'isApexWallet',
  'isAvalanche',
  'isBackpack',
  'isBifrost',
  'isBitKeep',
  'isBitski',
  'isBlockWallet',
  'isBraveWallet',
  'isCoinbaseWallet',
  'isDawn',
  'isEnkrypt',
  'isExodus',
  'isFrame',
  'isFrontier',
  'isGamestop',
  'isHyperPay',
  'isImToken',
  'isKuCoinWallet',
  'isMathWallet',
  // 'isMetaMask',
  'isOkxWallet',
  'isOKExWallet',
  'isOneInchAndroidWallet',
  'isOneInchIOSWallet',
  'isOneKey',
  'isOpera',
  'isPhantom',
  'isPortal',
  'isRabby',
  'isRainbow',
  'isStatus',
  'isTally',
  'isTokenPocket',
  'isTokenary',
  'isTrust',
  'isTrustWallet',
  'isUniswapWallet',
  'isXDEFI',
  'isZerion',
  'isBinance',
]

async function checkWalletSupportAddEthereumChain(connector: Connector) {
  try {
    if (typeof connector.getProvider !== 'function') return false

    const provider = (await connector.getProvider()) as any

    return provider && provider.isMetaMask && !WalletProviders.some((p: string) => p in provider)
  } catch (error) {
    console.error(error, 'wallet_addEthereumChain is not supported')
    return false
  }
}

async function fetchMEVStatus(walletClient: WalletClient): Promise<{ mevEnabled: boolean }> {
  if (!walletClient || !walletClient?.request) {
    console.error('Ethereum provider not found')
    return { mevEnabled: false }
  }

  try {
    const result = await walletClient.request({
      // @ts-ignore
      method: 'eth_call',
      params: [
        {
          from: walletClient.account?.address ?? '0x',
          to: '0x0000000000000000000000000000000000000048',
          value: '0x30',
          data: '0x',
        },
        'latest',
      ],
    })

    return { mevEnabled: result === '0x30' }
  } catch (error) {
    console.error('Error checking MEV status:', error)
    return { mevEnabled: false }
  }
}

export function useWalletSupportsAddEthereumChain() {
  const { connector } = useAccount()
  const { data, isLoading } = useQuery({
    queryKey: ['walletSupportsAddEthereumChain', connector?.uid],
    queryFn: () => checkWalletSupportAddEthereumChain(connector!),
    enabled: Boolean(connector),
    retry: false,
  })
  return { walletSupportsAddEthereumChain: data ?? false, isLoading }
}

export function useIsMEVEnabled() {
  const { data: walletClient } = useWalletClient()
  const { account, chainId } = useAccountActiveChain()
  const { walletType } = useWalletType()

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['isMEVEnabled', walletClient, account, chainId, walletType],
    queryFn: () => fetchMEVStatus(walletClient!),
    enabled: Boolean(account) && walletClient && chainId === ChainId.BSC,
    staleTime: 60000,
  })

  // console.log('isMEVEnabled', data?.mevEnabled, walletType, chainId, walletClient)
  return {
    isMEVEnabled: (data?.mevEnabled || (walletType === WalletType.mevDefaultOnBSC && chainId === ChainId.BSC)) ?? false,
    isLoading,
    refetch,
    isMEVProtectAvailable: chainId === ChainId.BSC,
  }
}

export const useShouldShowMEVToggle = () => {
  const { isLoading: isWalletSupportLoading } = useWalletSupportsAddEthereumChain()
  const { account } = useAccountActiveChain()
  const { isMEVEnabled, isLoading, isMEVProtectAvailable } = useIsMEVEnabled()
  const { walletType, isLoading: isWalletTypeLoading } = useWalletType()
  return (
    !isLoading &&
    !isWalletTypeLoading &&
    !isMEVEnabled &&
    !isWalletSupportLoading &&
    Boolean(account) &&
    walletType > WalletType.mevNotSupported &&
    isMEVProtectAvailable
  )
}

export const useAddMevRpc = (onSuccess?: () => void, onBeforeStart?: () => void, onFinish?: () => void) => {
  const { data: walletClient } = useWalletClient()
  const { connector } = useAccount()
  const addMevRpc = useCallback(async () => {
    onBeforeStart?.()
    try {
      const provider = (await connector?.getProvider()) as any
      // Check if the Ethereum provider is available
      if (walletClient) {
        // Prompt the wallet to add the custom network
        const result = await addChain(walletClient, { chain: BSCMevGuardChain })

        if (provider?.isMetaMask && !walletPretendToMetamask.some((d) => d in provider)) {
          console.info('MetaMask chain dapp detected. Adding RPC network again. on metamask dapp need to run twice')
          await addChain(walletClient, { chain: BSCMevGuardChain })
        }
        console.info('RPC network added successfully!', result)
        onSuccess?.()
      } else {
        console.warn('Ethereum provider not found. Please check your wallet')
      }
    } catch (error) {
      if ((error as any).code === MethodNotFoundRpcError.code) console.error('wallet_addEthereumChain is not supported')
      else console.error('Error adding RPC network:', error)
    } finally {
      onFinish?.()
    }
  }, [onBeforeStart, connector, walletClient, onSuccess, onFinish])
  return { addMevRpc }
}

export async function getWalletType(connector?: Connector): Promise<WalletType> {
  if (!connector || typeof connector.getProvider !== 'function') return WalletType.mevNotSupported
  const provider = (await connector.getProvider()) as any

  // check WalletConnect + supported wallets
  if (provider.isWalletConnect) {
    try {
      // check session metadata
      const walletName = provider.session?.peer?.metadata?.name
      if (walletConnectSupportDefaultMevOnBSC.includes(walletName)) {
        return WalletType.mevDefaultOnBSC
      }
    } catch (error) {
      console.error('Error detecting Wallet via WalletConnect:', error)
    }
  }

  if (
    walletSupportDefaultMevOnBSC.some((d) => d in provider) &&
    !walletSupportCustomRPCNative.some((d) => d in provider)
  )
    return WalletType.mevDefaultOnBSC
  if (walletSupportManualRPCConfig.some((d) => d in provider)) return WalletType.mevOnlyManualConfig
  if (walletSupportCustomRPCNative.some((d) => d in provider) && !walletPretendToMetamask.some((d) => d in provider))
    return WalletType.nativeSupportCustomRPC
  return WalletType.mevNotSupported
}

export function useWalletType() {
  useWalletDebugger()
  const { connector } = useAccount()
  const { data, isLoading } = useQuery({
    queryKey: ['useWalletType', connector?.uid],
    queryFn: () => getWalletType(connector!),
    enabled: Boolean(connector),
    retry: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })
  return { walletType: data ?? WalletType.mevNotSupported, isLoading }
}

function useWalletDebugger() {
  const { connector } = useAccount()

  useEffect(() => {
    const debugWallet = async () => {
      if (!connector) return

      try {
        const provider = (await connector.getProvider()) as any
        console.log('Provider full object:', provider)

        // 检查是否是 WalletConnect
        console.log('Is WalletConnect:', provider.isWalletConnect)

        // 尝试获取会话信息
        if (provider.session) {
          console.log('Session:', provider.session)
          console.log('Peer metadata:', provider.session.peer?.metadata)
        }

        // 检查其他可能的路径
        if (provider.signer) {
          console.log('Signer:', provider.signer)
          console.log('Signer session:', provider.signer.session)
        }

        // 检查所有属性
        console.log('All provider keys:', Object.keys(provider))

        // 检查特定属性
        console.log('isBinance:', 'isBinance' in provider)
        console.log('isTrust:', 'isTrust' in provider)
        console.log('isMetaMask:', 'isMetaMask' in provider)
      } catch (error) {
        console.error('Debug error:', error)
      }
    }

    debugWallet()
  }, [connector])

  return null // 这是一个纯调试组件，不需要渲染任何内容
}
