import { ChainId } from '@pancakeswap/chains'
import { useTranslation } from '@pancakeswap/localization'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  Box,
  Button,
  Flex,
  InfoIcon,
  Text,
  UserMenuDivider,
  UserMenuItem,
  useTooltip,
} from '@pancakeswap/uikit'
import { useState } from 'react'
import { ChainLogo } from 'src/ChainLogo'
import { Chain } from 'viem'
import { chainNameConverter } from '../utils/chainNameConverter'
import { evmChains } from '../utils/chains'

type WrongNetworkSelectProps = {
  switchNetwork?: (chainId: number) => void | Promise<void>
  chainId?: number
  currentChain?: Chain
  targetChainId?: number
  onDismiss: () => void
}

export const WrongNetworkSelect = ({
  switchNetwork,
  chainId,
  currentChain,
  onDismiss,
  targetChainId,
}: WrongNetworkSelectProps) => {
  const { t } = useTranslation()

  const { targetRef, tooltip, tooltipVisible } = useTooltip(
    t(
      'The URL you are accessing (Chain id: %chainId%) belongs to %network%; mismatching your wallet’s network. Please switch the network to continue.',
      {
        chainId,
        network: evmChains.find((c) => c.id === chainId)?.name ?? 'Unknown network',
      },
    ),
    {
      placement: 'auto-start',
      hideTimeout: 0,
    },
  )

  const localChainId = targetChainId || ChainId.BSC

  const localChainName = evmChains.find((c) => c.id === localChainId)?.name ?? 'BSC'

  const [isHover, setIsHover] = useState(false)

  return (
    <>
      <Flex ref={targetRef} alignItems="center" px="16px" py="8px">
        <InfoIcon color="textSubtle" />
        <Text color="textSubtle" pl="6px">
          {t('Please switch network')}
        </Text>
      </Flex>
      {tooltipVisible && tooltip}
      <UserMenuDivider />
      {currentChain && (
        <UserMenuItem
          style={{ justifyContent: 'flex-start' }}
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
        >
          <ChainLogo chainId={currentChain.id} />
          <Text color="secondary" bold pl="12px">
            {chainNameConverter(currentChain.name)}
          </Text>
        </UserMenuItem>
      )}
      <Box px="16px" pt="8px">
        {isHover ? <ArrowUpIcon color="text" /> : <ArrowDownIcon color="text" />}
      </Box>
      <UserMenuItem
        onClick={() => {
          switchNetwork?.(localChainId)
          onDismiss()
        }}
        style={{ justifyContent: 'flex-start' }}
      >
        <ChainLogo chainId={localChainId} />
        <Text pl="12px">{chainNameConverter(localChainName)}</Text>
      </UserMenuItem>
      <Button
        mx="16px"
        my="8px"
        scale="sm"
        onClick={() => {
          switchNetwork(localChainId)
          onDismiss()
        }}
      >
        {t('Switch network in wallet')}
      </Button>
    </>
  )
}
