import { useTranslation } from '@pancakeswap/localization'
import { RowBetween, ScanLink, Text } from '@pancakeswap/uikit'
import { formatTimestamp, Precision } from '@pancakeswap/utils/formatTimestamp'
import { ChainLinkSupportChains } from 'state/info/constant'
import { getBlockExploreLink } from 'utils'

export function GiftInfoExpireOn({ expiryTimestamp }: { expiryTimestamp: string }) {
  const { t } = useTranslation()

  return (
    <RowBetween>
      <Text color="textSubtle" small>
        {t('Expires on:')}
      </Text>
      <Text small>
        {formatTimestamp(new Date(expiryTimestamp).getTime(), {
          precision: Precision.MINUTE,
        })}
      </Text>
    </RowBetween>
  )
}

export function GiftInfoCreatedAt({ txnHash, chainId }: { txnHash: string; chainId: number }) {
  const { t } = useTranslation()

  return (
    <RowBetween>
      <Text color="textSubtle" small>
        {t('Created at:')}
      </Text>
      <ScanLink
        useBscCoinFallback={ChainLinkSupportChains.includes(chainId)}
        href={getBlockExploreLink(txnHash, 'transaction', chainId)}
      />
    </RowBetween>
  )
}
