import { Trans } from '@simpleflow/l10n'
import { Link, Text } from '@simpleflow/uikit'
import { FAQType } from 'views/LiquidStaking/constants/types'

export const SrwSsrwFaq = (): FAQType[] => [
  {
    id: 1,
    title: <Trans>What is sSRW?</Trans>,
    description: (
      <Text color="textSubtle">
        <Trans>
          sSRW (Staked SRW) is a liquid staking token that represents your staked SRW on SimpleChain. When you stake
          SRW, you receive sSRW in return, which can be used in DeFi protocols while your original SRW continues to earn
          staking rewards.
        </Trans>
      </Text>
    ),
  },
  {
    id: 2,
    title: <Trans>How does SRW liquid staking work?</Trans>,
    description: (
      <Text color="textSubtle">
        <Trans>
          When you deposit SRW into the liquid staking contract, you receive sSRW tokens. The exchange rate between SRW
          and sSRW increases over time as staking rewards accumulate. When you want to withdraw, you can convert your
          sSRW back to SRW at the current exchange rate.
        </Trans>
      </Text>
    ),
  },
  {
    id: 3,
    title: <Trans>What are the benefits of liquid staking?</Trans>,
    description: (
      <Text color="textSubtle">
        <Trans>
          Liquid staking allows you to earn staking rewards while maintaining liquidity. You can use sSRW in other DeFi
          protocols, trade it, or provide liquidity, all while your underlying SRW continues to earn staking rewards.
        </Trans>
      </Text>
    ),
  },
  {
    id: 4,
    title: <Trans>How do I unstake my SRW?</Trans>,
    description: (
      <Text color="textSubtle">
        <Trans>
          To unstake, you need to request a withdrawal by converting your sSRW back to SRW. There may be an unbonding
          period during which your SRW is locked. After the unbonding period, you can claim your SRW.
        </Trans>
      </Text>
    ),
  },
  {
    id: 5,
    title: <Trans>Is there a minimum amount to stake?</Trans>,
    description: (
      <Text color="textSubtle">
        <Trans>
          There is no minimum amount required to stake SRW. You can stake any amount of SRW and receive the
          corresponding amount of sSRW based on the current exchange rate.
        </Trans>
      </Text>
    ),
  },
]
