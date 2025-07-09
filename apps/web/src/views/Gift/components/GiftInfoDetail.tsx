import { Box, RowBetween, ScanLink, Text } from '@pancakeswap/uikit'
import { formatTimestamp, Precision } from '@pancakeswap/utils/formatTimestamp'
import { ChainLinkSupportChains } from 'state/info/constant'
import { getBlockExploreLink } from 'utils'
import { isAddress } from 'viem/utils'
import { shortenAddress } from 'views/V3Info/utils'

export function GiftInfoTimestamp({ text, timestamp }: { text: string; timestamp: string }) {
  return (
    <RowBetween>
      <Text color="textSubtle" small>
        {text}
      </Text>
      <Text small>
        {formatTimestamp(new Date(timestamp).getTime(), {
          precision: Precision.MINUTE,
        })}
      </Text>
    </RowBetween>
  )
}

export function GiftInfoTxn({ text, txnHash, chainId }: { text: string; txnHash: string; chainId: number }) {
  return (
    <RowBetween>
      <Text color="textSubtle" small>
        {text}
      </Text>
      <ScanLink
        useBscCoinFallback={ChainLinkSupportChains.includes(chainId)}
        href={getBlockExploreLink(txnHash, 'transaction', chainId)}
      />
    </RowBetween>
  )
}

export function GiftInfoAddress({ text, address }: { text: string; address?: string | null }) {
  return (
    <RowBetween>
      <Text color="textSubtle" small>
        {text}
      </Text>
      <Text small>{address && isAddress(address) ? shortenAddress(address) : '-'}</Text>
    </RowBetween>
  )
}

export function GiftInfoDescription({ text, description }: { text: string; description: string }) {
  return (
    <Box mb="16px">
      <Text bold mb="8px">
        {text}
      </Text>
      <Text color="textSubtle" small>
        {description}
      </Text>
    </Box>
  )
}
