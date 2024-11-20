import { useTranslation } from '@pancakeswap/localization'
import { Button, CheckmarkCircleFillIcon, SwapLoading } from '@pancakeswap/uikit'
import ConnectWalletButton from 'components/ConnectWalletButton'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import useTheme from 'hooks/useTheme'
import { useCallback, useState } from 'react'
import { bsc } from 'viem/chains'

export const AddMevRpcButton: React.FC = () => {
  const { t } = useTranslation()
  const { account } = useActiveWeb3React()
  const [addedToWallet, setAddedToWallet] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { theme } = useTheme()

  const addRpc = useCallback(async () => {
    setIsLoading(true)
    try {
      const networkParams = {
        chainId: '0x38', // Chain ID in hexadecimal (56 for Binance Smart Chain)
        chainName: 'PancakeSwap MEV Guard',
        rpcUrls: ['https://bscrpc.pancakeswap.finance'], // PancakeSwap MEV RPC
        nativeCurrency: bsc.nativeCurrency,
        blockExplorerUrls: [bsc.blockExplorers.default.url],
      }

      // Check if the Ethereum provider is available
      if (window.ethereum) {
        try {
          // Prompt the wallet to add the custom network
          await (window.ethereum as any)?.request({
            method: 'wallet_addEthereumChain',
            params: [networkParams],
          })
          console.log('RPC network added successfully!')
          setAddedToWallet(true)
        } catch (error) {
          console.error('Error adding RPC network:', error)
        }
      } else {
        console.warn('Ethereum provider not found. Please check your wallet')
      }
    } catch (error) {
      console.error(error)
    }
    setIsLoading(false)
  }, [])

  if (!account) {
    return <ConnectWalletButton withIcon />
  }
  return (
    <Button
      width="100%"
      mb="16px"
      endIcon={
        isLoading ? (
          <SwapLoading />
        ) : addedToWallet ? (
          <CheckmarkCircleFillIcon color={theme.colors.background} />
        ) : undefined
      }
      variant={addedToWallet ? 'success' : undefined}
      isLoading={isLoading}
      onClick={addedToWallet && !isLoading ? undefined : addRpc}
    >
      {isLoading ? t('Adding to Wallet') : addedToWallet ? t('Added to wallet') : t('Add to Wallet')}
    </Button>
  )
}
