import { Trans } from '@pancakeswap/localization'
import { Card, CardBody, CardHeader, Heading, Text } from '@pancakeswap/uikit'
import Divider from 'components/Divider'
import FoldableText from 'components/FoldableSection/FoldableText'
import styled from 'styled-components'

const faqs = [
  {
    title: <Trans>What am I redeeming and how does this work?</Trans>,
    description: (
      <>
        <Trans>You're redeeming:</Trans>
        <ul>
          <li>
            <Trans>Underlying SDX (from your veSDX position)</Trans>
          </li>
          <li>
            <Trans>Legacy SDX Pool rewards</Trans>
          </li>
          <li>
            <Trans>
              Unclaimed rewards: This includes revenue sharing rewards and any remaining veSDX gauge voting rewards.
            </Trans>
          </li>
        </ul>
        <Trans>
          Important: If you want to receive rewards from Epoch 38 (April 25 – May 6), do not withdraw SDX before 00:00
          AM UTC, May 7, 2025.
        </Trans>
      </>
    ),
  },
  {
    title: <Trans>How long will this redemption page be available?</Trans>,
    description: (
      <Trans>
        You'll have 6 months to redeem your veSDX and other unclaimed rewards, from April 23, 2025 at 8:00 AM UTC until
        October 23, 2025.
      </Trans>
    ),
  },
  {
    title: <Trans>What if I used a veSDX manager (e.g., Aster, StakeDAO, SDXPie)?</Trans>,
    description: (
      <>
        <ul>
          <li>
            <Trans>
              If your veSDX is managed through platforms like Aster, StakeDAO, or SDXpie, these protocols will launch a
              redemption page on their interfaces, allowing users who have staked with them to redeem their xSDX for SDX
              on a 1:1 basis. Please refer to the veSDX Managers' respective announcements for more detail.
            </Trans>
          </li>
          <li>
            <Trans>
              SimpleFlow cannot process redemptions for externally managed veSDX — please check directly with those
              platforms.
            </Trans>
          </li>
        </ul>
      </>
    ),
  },
  {
    title: <Trans>What's happening to veSDX and gauge voting?</Trans>,
    description: (
      <>
        <ul>
          <li>
            <Trans>Starting 00:00 AM UTC April 23, 2025, veSDX and all gauge voting will be retired.</Trans>
          </li>
          <li>
            <Trans>The final round of gauge voting will end on 00:00 AM UTC, April 23, 2025 (Epoch 37).</Trans>
          </li>
          <li>
            <Trans>Results from Epoch 37 will be executed in Epoch 38 (April 25 – May 6).</Trans>
          </li>
          <li>
            <Trans>
              Gauges rewards, including veSDX Pool APR and Bribe APR, will continue to accrue until May 7, 2025.
            </Trans>
          </li>
          <li>
            <Trans>
              To earn all final APRs (veSDX Pool + Bribe + Revenue Sharing), do not redeem SDX before 00:00 AM UTC, May
              7, 2025.
            </Trans>
          </li>
        </ul>
      </>
    ),
  },
  {
    title: <Trans>What's the impact on other products like yield farming and revenue sharing?</Trans>,
    description: (
      <>
        <ul>
          <li>
            <Trans>
              Yield farming boosts (from veSDX) will be phased out across position managers, Syrup Pools, and farming
              activities between April 24 and May 7, 2025.
            </Trans>
          </li>
          <li>
            <Trans>
              5% Revenue Sharing from trading fees will end on 00:00 UTC on May 7, 2025. Funds previously allocated to
              revenue sharing will now be redirected to the SDX burn mechanism, increasing the burn rate for these pools
              from 10% to 15%.
            </Trans>
          </li>
          <li>
            <Trans>
              The SimpleFlow UI will gradually reflect the retirement of affected products from these changes.
            </Trans>
          </li>
        </ul>
      </>
    ),
  },
]

export const RedeemFaqs = () => (
  <StyledCard>
    <CardHeader
      style={{
        background: 'transparent',
      }}
    >
      <Heading size="lg">
        <Trans>FAQ</Trans>
      </Heading>
    </CardHeader>
    <CardBody>
      {faqs.map(({ title, description }, i) => (
        <FoldableText key={i} mb={i + 1 === faqs.length ? '' : '24px'} title={title}>
          <Text color="textSubtle" as="p">
            {description}
          </Text>
        </FoldableText>
      ))}
      <Divider />
    </CardBody>
  </StyledCard>
)

const StyledCard = styled(Card)`
  max-width: 550px;
  margin: 0 auto;
  border-radius: 24px;
  margin-top: 36px;

  ul li {
    position: relative; /* Needed to position custom bullet */
    padding-left: 20px; /* Adjust to your desired padding */
    margin-bottom: 8px; /* Consistent vertical spacing */
  }
`
