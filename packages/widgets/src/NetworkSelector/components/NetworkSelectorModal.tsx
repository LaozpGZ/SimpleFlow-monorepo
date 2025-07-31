import { useTheme } from '@pancakeswap/hooks'
import { useTranslation } from '@pancakeswap/localization'
import {
  Box,
  ModalCloseButton,
  ModalHeader,
  ModalTitle,
  ModalV2,
  ModalWrapper,
  Text,
  useMatchBreakpoints,
  UserMenuItem,
} from '@pancakeswap/uikit'
import { useCallback, useMemo } from 'react'
import { ChainLogo } from '../../ChainLogo'
import { chainNameConverter } from '../utils/chainNameConverter'
import { getSortedChains } from '../utils/getSortedChains'
import { WrongNetworkSelect } from './WrongNetworkSelect'

export type NetworkSelectProps = {
  showTestnet?: boolean
  chainId?: number
  chains?: Array<number | 'Solana' | 'Aptos'>
  isWrongNetwork?: boolean
  switchNetwork?: (chainId: number | 'Solana' | 'Aptos') => void | Promise<void>
  onDismiss?: () => void
}

const NetworkSelect: React.FC<NetworkSelectProps> = ({
  showTestnet,
  chainId,
  chains = [],
  switchNetwork,
  onDismiss,
  isWrongNetwork,
}) => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { isMobile } = useMatchBreakpoints()
  const networks = useMemo(() => {
    const defaultChains = getSortedChains(chainId, showTestnet)
    return chains.length > 0
      ? defaultChains.filter((chain) => chains.includes(chain.id) || chains.includes(chain.name as 'Solana' | 'Aptos'))
      : defaultChains
  }, [chainId, showTestnet])

  return (
    <Box borderRadius={isMobile ? '32px' : '32px 32px 0 0'} overflow="hidden">
      <ModalHeader background={theme.colors.gradientCardHeader}>
        <ModalTitle>
          <Text bold fontSize="20px">
            {t('Select a Network')}
          </Text>
        </ModalTitle>
        <ModalCloseButton onDismiss={onDismiss} />
      </ModalHeader>

      <Box maxHeight="70vh" overflow="auto" padding="16px 0">
        {networks.map((net) =>
          net.isEvm ? (
            // EVM item: switch in-wallet
            <UserMenuItem
              key={net.id}
              style={{ justifyContent: 'flex-start', cursor: 'pointer', padding: '0px 24px' }}
              onClick={() => {
                if (net.id !== chainId || isWrongNetwork) {
                  switchNetwork?.(net.id)
                }
                onDismiss?.()
              }}
            >
              <ChainLogo chainId={net.id} />
              <Text
                color={net.id === chainId && !isWrongNetwork ? 'secondary' : 'text'}
                bold={net.id === chainId && !isWrongNetwork}
                pl="12px"
              >
                {chainNameConverter(net.name)}
              </Text>
            </UserMenuItem>
          ) : (
            // non-EVM item: external link
            <UserMenuItem
              key={`non-evm-${net.id}`}
              onClick={() => {
                if (net.id !== chainId || isWrongNetwork) {
                  switchNetwork?.(net.name as 'Solana' | 'Aptos')
                }
                onDismiss?.()
              }}
              style={{ justifyContent: 'flex-start', cursor: 'pointer', padding: '0px 24px' }}
            >
              <img src={net.image} width={24} height={24} alt={net.name} />
              <Text color="text" pl="12px">
                {net.name}
              </Text>
            </UserMenuItem>
          ),
        )}
      </Box>
    </Box>
  )
}

export type NetworkSelectorModalProps = {
  chainId?: number
  chains?: Array<number | 'Solana' | 'Aptos'>
  isNotMatched?: boolean
  isWrongNetwork?: boolean
  switchNetwork?: (chainId: number | 'Solana' | 'Aptos') => void | Promise<void>

  isOpen?: boolean
  setIsOpen?: (isOpen: boolean) => void
}

export const NetworkSelectorModal: React.FC<NetworkSelectorModalProps> = ({
  chainId,
  chains,
  isWrongNetwork = false,
  isNotMatched = false,
  switchNetwork,

  isOpen = false,
  setIsOpen = () => {},
}) => {
  const handleDismiss = useCallback(() => {
    setIsOpen(false)
  }, [])
  return (
    <ModalV2 isOpen={isOpen} onDismiss={handleDismiss} closeOnOverlayClick>
      <ModalWrapper minWidth="360px" maxHeight="90vh" style={{ overflowY: 'auto' }}>
        {isNotMatched ? (
          <WrongNetworkSelect switchNetwork={switchNetwork} chainId={chainId} onDismiss={handleDismiss} />
        ) : (
          <NetworkSelect
            chains={chains}
            switchNetwork={switchNetwork}
            chainId={chainId}
            isWrongNetwork={isWrongNetwork}
            onDismiss={handleDismiss}
          />
        )}
      </ModalWrapper>
    </ModalV2>
  )
}
