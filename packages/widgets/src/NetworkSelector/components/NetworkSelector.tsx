import { useTranslation } from '@pancakeswap/localization'
import { NATIVE } from '@pancakeswap/sdk'
import { Box, UserMenu, useTooltip } from '@pancakeswap/uikit'
import { useCallback, useMemo, useState } from 'react'
import { chainNameConverter } from '../utils/chainNameConverter'
import { evmChains } from '../utils/chains'
import { SHORT_SYMBOL } from '../utils/shortSymbol'
import { NetworkSelectorModal } from './NetworkSelectorModal'

export type NetworkSelectorProps = {
  chainId?: number
  isLoading?: boolean
  isWrongNetwork?: boolean
  cannotChangeNetwork?: boolean
  isNotMatched?: boolean
  switchNetwork?: (chainId: number | 'Solana' | 'Aptos') => void | Promise<void>

  chains?: Array<number | 'Solana' | 'Aptos'>

  cdnUrl?: string
}

export const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  chainId,
  isLoading,
  isWrongNetwork,
  cannotChangeNetwork,
  isNotMatched,
  switchNetwork,

  chains = [],

  cdnUrl = 'https://assets.pancakeswap.finance/',
}) => {
  const { t } = useTranslation()

  // const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const foundChain = useMemo(() => evmChains.find((c) => c.id === chainId), [chainId])
  const symbol =
    (foundChain?.id
      ? SHORT_SYMBOL[foundChain.id as keyof typeof SHORT_SYMBOL] ?? NATIVE[foundChain.id]?.symbol
      : undefined) ?? foundChain?.nativeCurrency?.symbol
  const { targetRef, tooltip, tooltipVisible } = useTooltip(
    t('Unable to switch network. Please try it on your wallet'),
    { placement: 'bottom' },
  )

  const handleOpenNetworkModal = useCallback(() => {
    if (!cannotChangeNetwork) {
      setIsOpen(true)
    }
  }, [cannotChangeNetwork])

  if (!chainId || (typeof window !== 'undefined' && window.location.pathname.includes('/info'))) {
    return null
  }

  return (
    <Box ref={cannotChangeNetwork ? targetRef : null} height="100%">
      {cannotChangeNetwork && tooltipVisible && tooltip}
      <UserMenu
        mr="8px"
        placement="bottom"
        variant={isLoading ? 'pending' : isWrongNetwork ? 'danger' : 'default'}
        avatarSrc={`${cdnUrl}/web/chains/${chainId}.png`}
        disabled={cannotChangeNetwork}
        text={
          isLoading ? (
            t('Requesting')
          ) : isWrongNetwork ? (
            t('Network')
          ) : foundChain ? (
            <>
              <Box display={['none', null, null, null, null, null, 'block']}>{chainNameConverter(foundChain.name)}</Box>
              <Box display={['block', null, null, null, null, null, 'none']}>{symbol}</Box>
            </>
          ) : (
            t('Select a Network')
          )
        }
        onClick={handleOpenNetworkModal}
      />

      <NetworkSelectorModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        chainId={chainId}
        chains={chains}
        isNotMatched={isNotMatched}
        isWrongNetwork={isWrongNetwork}
        switchNetwork={switchNetwork}
      />
    </Box>
  )
}
