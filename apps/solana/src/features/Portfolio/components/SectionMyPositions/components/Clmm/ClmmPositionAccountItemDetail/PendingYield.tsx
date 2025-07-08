import { Flex, HStack, Text } from '@chakra-ui/react'
import { ApiV3Token } from '@pancakeswap/solana-core-sdk'
import { useTranslation } from '@pancakeswap/localization'
import Button from '@/components/Button'
import TokenAvatar from '@/components/TokenAvatar'
import useResponsive from '@/hooks/useResponsive'
import { colors } from '@/theme/cssVariables'
import { formatCurrency } from '@/utils/numberish/formatter'
import { getMintSymbol } from '@/utils/token'
import Tooltip from '@/components/Tooltip'
import RewardBreakdownSwitch from '@/components/RewardBreakdownSwitch'
import { useAppStore } from '@/store'
import { BreakdownRewardInfo } from '@/hooks/pool/clmm/useFetchClmmRewardInfo'

type PendingYieldProps = {
  pendingYield?: string
  isLoading?: boolean
  hasReward?: boolean
  rewardInfos: { mint: ApiV3Token; amount: string; amountUSD: string }[]
  breakdownRewardInfo: BreakdownRewardInfo
  onHarvest: () => void
}

export default function PendingYield({
  isLoading,
  hasReward,
  pendingYield,
  rewardInfos,
  breakdownRewardInfo,
  onHarvest
}: PendingYieldProps) {
  const { t } = useTranslation()
  const rewardBreakdownMode = useAppStore((s) => s.rewardBreakdownMode)
  return (
    <Flex flex={1} justify="space-around" w="full" fontSize="sm" flexDirection="column" gap={3} p={[4, 0]}>
      <HStack justifyContent="space-between">
        <HStack>
          <Text color={colors.textSecondary} whiteSpace="nowrap">
            {t('Pending Yield')}
          </Text>
          <Text color={colors.textPrimary} whiteSpace="nowrap">
            ({pendingYield ?? '$0'})
          </Text>
          <RewardBreakdownSwitch />
        </HStack>
        <Tooltip
          label={
            hasReward
              ? t('Harvest Rewards')
              : t('No rewards to harvest yet. Check back later — your earnings will grow as users trade in this pool.')
          }
        >
          <Button
            isLoading={isLoading}
            isDisabled={!hasReward}
            onClick={onHarvest}
            width={['69px']}
            height="9"
            borderRadius="xl"
            size="xs"
            px={1}
            fontSize="md"
            variant="outline"
            style={{
              borderColor: colors.primary60,
              color: colors.primary60
            }}
          >
            {t('Harvest')}
          </Button>
        </Tooltip>
      </HStack>

      {rewardBreakdownMode === 'Aggr' ? (
        <Flex display="grid" gridTemplateColumns="repeat(2, 1fr)" columnGap={2} rowGap={2}>
          {rewardInfos.map((r, index) => (
            <Flex key={r.mint.address} alignItems="center" gap={1} justifyContent="start">
              <TokenAvatar key={`pool-reward-${r.mint.address}`} size="sm" token={r.mint} />
              <Text color={colors.textPrimary}>
                {formatCurrency(r.amount, {
                  abbreviated: true,
                  maximumDecimalTrailingZeroes: 2
                })}
              </Text>
              <Text color={colors.textSecondary} display={['block', 'none', 'block']}>
                {getMintSymbol({ mint: r.mint, transformSol: true })}
              </Text>
              <Text color={colors.textPrimary}>
                (
                {formatCurrency(r.amountUSD, {
                  symbol: '$',
                  abbreviated: true,
                  maximumDecimalTrailingZeroes: 2
                })}
                )
              </Text>
            </Flex>
          ))}
        </Flex>
      ) : (
        <>
          <Text>Trade Fees</Text>
          <Flex display="grid" gridTemplateColumns="repeat(2, 1fr)" columnGap={2} rowGap={2}>
            <Flex key={breakdownRewardInfo.fee.A.mint.address} alignItems="center" gap={1} justifyContent="start">
              <TokenAvatar key={`pool-reward-${breakdownRewardInfo.fee.A.mint.address}`} size="sm" token={breakdownRewardInfo.fee.A.mint} />
              <Text color={colors.textPrimary}>
                {formatCurrency(breakdownRewardInfo.fee.A.amount, {
                  abbreviated: true,
                  maximumDecimalTrailingZeroes: 2
                })}
              </Text>
              <Text color={colors.textSecondary} display={['block', 'none', 'block']}>
                {getMintSymbol({ mint: breakdownRewardInfo.fee.A.mint, transformSol: true })}
              </Text>
              <Text color={colors.textPrimary}>
                (
                {formatCurrency(breakdownRewardInfo.fee.A.amountUSD, {
                  symbol: '$',
                  abbreviated: true,
                  maximumDecimalTrailingZeroes: 2
                })}
                )
              </Text>
            </Flex>
            <Flex key={breakdownRewardInfo.fee.B.mint.address} alignItems="center" gap={1} justifyContent="start">
              <TokenAvatar key={`pool-reward-${breakdownRewardInfo.fee.B.mint.address}`} size="sm" token={breakdownRewardInfo.fee.B.mint} />
              <Text color={colors.textPrimary}>
                {formatCurrency(breakdownRewardInfo.fee.B.amount, {
                  abbreviated: true,
                  maximumDecimalTrailingZeroes: 2
                })}
              </Text>
              <Text color={colors.textSecondary} display={['block', 'none', 'block']}>
                {getMintSymbol({ mint: breakdownRewardInfo.fee.B.mint, transformSol: true })}
              </Text>
              <Text color={colors.textPrimary}>
                (
                {formatCurrency(breakdownRewardInfo.fee.B.amountUSD, {
                  symbol: '$',
                  abbreviated: true,
                  maximumDecimalTrailingZeroes: 2
                })}
                )
              </Text>
            </Flex>
          </Flex>
          <Text>Farm Rewards</Text>
          <Flex display="grid" gridTemplateColumns="repeat(2, 1fr)" columnGap={2} rowGap={2}>
            {breakdownRewardInfo.rewards.map((r, index) => (
              <Flex key={r.mint.address} alignItems="center" gap={1} justifyContent="start">
                <TokenAvatar key={`pool-reward-${r.mint.address}`} size="sm" token={r.mint} />
                <Text color={colors.textPrimary}>
                  {formatCurrency(r.amount, {
                    abbreviated: true,
                    maximumDecimalTrailingZeroes: 2
                  })}
                </Text>
                <Text color={colors.textSecondary} display={['block', 'none', 'block']}>
                  {getMintSymbol({ mint: r.mint, transformSol: true })}
                </Text>
                <Text color={colors.textPrimary}>
                  (
                  {formatCurrency(r.amountUSD, {
                    symbol: '$',
                    abbreviated: true,
                    maximumDecimalTrailingZeroes: 2
                  })}
                  )
                </Text>
              </Flex>
            ))}
          </Flex>
        </>
      )}
    </Flex>
  )
}
