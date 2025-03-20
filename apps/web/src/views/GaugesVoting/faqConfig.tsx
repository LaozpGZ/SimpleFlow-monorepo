import { Link } from '@pancakeswap/uikit'
import { FaqConfig } from 'components/PinnedFAQButton'
import Trans from 'components/Trans'
import { styled } from 'styled-components'

const InlineLink = styled(Link)`
  display: inline;
`

const faqConfig: FaqConfig[] = [
  {
    title: <Trans>What is gauges voting?</Trans>,
    description: [
      <Trans key="gauges-voting-desc">
        Gauges voting lets veCAKE holders vote on which liquidity pools receive CAKE emissions (rewards). The more votes
        a pool gets, the more rewards it distributes to liquidity providers.
      </Trans>,
    ],
  },
  {
    title: <Trans>What is veCAKE?</Trans>,
    description: [
      <>
        <Trans key="vecake-desc">
          veCAKE (vote-escrowed CAKE) is a token you receive when locking CAKE. It gives you voting power in gauge
          voting and boosts rewards in the PancakeSwap ecosystem.
        </Trans>
        <InlineLink ml="4px" external href="https://docs.pancakeswap.finance/products/vecake/what-is-vecake">
          <Trans>Learn more here</Trans>
        </InlineLink>
      </>,
    ],
  },
  {
    title: <Trans>How does gauges voting benefit me?</Trans>,
    description: [
      <Trans key="gauges-benefits">By voting with veCAKE, you can:</Trans>,
      <ul>
        <li>
          <Trans>Direct CAKE emissions to the pools you provide liquidity in, increasing your yield.</Trans>
        </li>
        <li>
          <Trans>Influence which pools get more rewards, shaping PancakeSwap&apos;s reward distribution.</Trans>
        </li>
        <li>
          <>
            <Trans>Earn voting incentives (</Trans>
            <InlineLink external href="https://docs.pancakeswap.finance/products/vecake/bribes-vote-incentives">
              <Trans>bribes</Trans>
            </InlineLink>
            <Trans>) from projects looking to attract liquidity to their pools.</Trans>
          </>
        </li>
      </ul>,
    ],
  },
  {
    title: <Trans>How do I participate in gauge voting?</Trans>,
    description: [
      <ul key="participate-steps">
        <li>
          <Trans>Lock CAKE to receive veCAKE.</Trans>
        </li>
        <li>
          <Trans>Use veCAKE to vote for your preferred liquidity pools.</Trans>
        </li>
        <li>
          <>
            <Trans>Votes are locked in for </Trans>
            <strong>
              <Trans>10 days</Trans>
            </strong>
            <Trans> after any update. If unchanged, they will carry over to the next epoch automatically.</Trans>
          </>
        </li>
      </ul>,
    ],
  },
  {
    title: <Trans>What is a boosted gauge?</Trans>,
    description: [
      <>
        <Trans key="boosted-gauge-desc">
          A boosted gauge is a liquidity pool that allows users with veCAKE to earn additional CAKE rewards (1X - 2.5X)
          beyond the standard emissions.
        </Trans>
      </>,
    ],
  },
]

export default faqConfig
