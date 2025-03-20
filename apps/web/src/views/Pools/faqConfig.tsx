import { FaqConfig } from 'components/PinnedFAQButton'
import Trans from 'components/Trans'

const faqConfig: FaqConfig[] = [
  {
    title: <Trans>What are Syrup Pools?</Trans>,
    description: [
      <Trans key="syrup-pools-desc">
        Syrup Pools allow you to stake CAKE and earn passive rewards. By depositing CAKE into a Syrup Pool, you can
        receive additional CAKE or other tokens from partner projects, depending on the pool.
      </Trans>,
    ],
  },
  {
    title: <Trans>How do I stake CAKE in Syrup Pools?</Trans>,
    description: [
      <>
        <Trans key="stake-cake-desc">Go to the</Trans> <strong>Syrup Pools</strong>{' '}
        <Trans>
          section on PancakeSwap, choose a pool, and deposit CAKE. Your rewards will start accumulating automatically.
          You can unstake your CAKE anytime unless otherwise stated.
        </Trans>
      </>,
    ],
  },
  {
    title: <Trans>What rewards can I earn from Syrup Pools?</Trans>,
    description: [
      <ul key="rewards-list">
        <li>
          <strong>CAKE Pools</strong>: <Trans>Earn CAKE by staking CAKE.</Trans>
        </li>
        <li>
          <strong>Partner Token Pools</strong>: <Trans>Earn tokens from partner projects by staking CAKE.</Trans>
        </li>
      </ul>,
    ],
  },
  {
    title: <Trans>How do I claim my rewards?</Trans>,
    description: [
      <ul key="claim-rewards-steps">
        <li>
          <>
            <Trans>In</Trans> <strong>Auto CAKE Pools</strong>,{' '}
            <Trans>
              rewards are automatically compounded, meaning they are reinvested for higher returns. You can withdraw
              CAKE anytime.
            </Trans>
          </>
        </li>
        <li>
          <>
            <Trans>In</Trans> <strong>Manual CAKE Pools</strong> <Trans>and other Syrup Pools, you need to</Trans>{' '}
            <strong>manually claim</strong> <Trans>rewards by clicking the &quot;Harvest&quot; button.</Trans>
          </>
        </li>
      </ul>,
    ],
  },
  {
    title: <Trans>Are there any fees for staking or unstaking?</Trans>,
    description: [
      <ul key="fees-list">
        <li>
          <>
            <strong>Auto CAKE Pool</strong>: <Trans>A</Trans> <strong>2% performance fee</strong>{' '}
            <Trans>applies to rewards when they are auto-compounded. Unstaking within</Trans> <strong>72 hours</strong>{' '}
            <Trans>incurs a</Trans> <strong>0.1% withdrawal fee</strong>.
          </>
        </li>
        <li>
          <>
            <strong>Manual CAKE Pool & Partner Pools</strong>: <Trans>No fees for staking or unstaking.</Trans>
          </>
        </li>
      </ul>,
    ],
  },
  {
    title: <Trans>What happens if I don&apos;t claim my rewards?</Trans>,
    description: [
      <>
        <Trans>Your rewards will continue to accumulate while your CAKE remains staked. However, in</Trans>{' '}
        <strong>Auto CAKE Pools</strong>,{' '}
        <Trans>
          rewards are compounded automatically, so you won&apos;t see a claimable balance unless you unstake.
        </Trans>
      </>,
    ],
  },
  {
    title: <Trans>What is the difference between the Auto and Manual CAKE Pools?</Trans>,
    description: [
      <ul key="pool-differences">
        <li>
          <>
            <strong>Auto CAKE Pool</strong>:{' '}
            <Trans>Automatically compounds your rewards, increasing earnings over time.</Trans>
          </>
        </li>
        <li>
          <>
            <strong>Manual CAKE Pool</strong>: <Trans>Requires you to manually claim and reinvest your rewards.</Trans>
          </>
        </li>
      </ul>,
    ],
  },
]

export default faqConfig
