import { useTranslation } from '@pancakeswap/localization'
import { Button, CheckmarkCircleFillIcon, SwapLoading } from '@pancakeswap/uikit'
import ConnectWalletButton from 'components/ConnectWalletButton'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import useTheme from 'hooks/useTheme'
import { useCallback, useState } from 'react'

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
        chainName: 'Binance Smart Chain MEV',
        rpcUrls: ['https://mev-rpc.pancakeswap.finance'], // PancakeSwap MEV RPC
        nativeCurrency: {
          name: 'BNB',
          symbol: 'BNB',
          decimals: 18,
        },
        blockExplorerUrls: ['https://bscscan.com'], // Optional: block explorer
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
        alert('Ethereum provider not found. Please install MetaMask!')
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
