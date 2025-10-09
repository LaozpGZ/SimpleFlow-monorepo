import { Trans } from '@pancakeswap/localization'
import { Card, CardBody, CardHeader, Heading, Container, Link, Text, Box } from '@pancakeswap/uikit'
import { styled } from 'styled-components'
import FoldableText from 'components/FoldableSection/FoldableText'
import useIfo from '../../hooks/useIfo'

const StyledCardHeader = styled(CardHeader)`
  background: ${({ theme }) =>
    theme.isDark
      ? 'linear-gradient(112deg, #1a1a2e 0%, #16213e 100%)'
      : 'linear-gradient(112deg, #F2ECF2 0%, #E8F2F6 100%)'};
  padding: 24px;
`

const StyledHeading = styled(Heading)`
  color: ${({ theme }) => theme.colors.secondary};
  font-size: 24px;
  font-weight: 600;
`

const InlineLink = styled(Link)`
  display: inline-block;
`

const DefaultQuestions: React.FC = () => {
  const { pools } = useIfo()

  const stakeSymbols = pools?.map((pool) => pool.stakeCurrency?.symbol).filter(Boolean) as string[]
  const symbol =
    stakeSymbols.length === 1
      ? stakeSymbols[0]
      : stakeSymbols.length >= 2
      ? `$${stakeSymbols[0]} or $${stakeSymbols[1]}`
      : '$CAKE'

  const faqs = [
    {
      title: <Trans>What is a CAKE.PAD Event?</Trans>,
      description: (
        <>
          <Trans>
            <p>Evolved from our IFO (Initial Farm Offering), CAKE.PAD is a platform to launch new tokens.</p>
          </Trans>
          <Trans>
            <p>
              Users can buy project tokens using{' '}
              <Text as="span" bold>
                {symbol}
              </Text>
              , while projects gain liquidity, visibility, and direct access to our community.
            </p>
          </Trans>
          <br />
          <Trans
            components={[
              <InlineLink key="user" external href="https://docs.pancakeswap.finance/earn/cakepad/faq-users" />,
              <InlineLink key="partner" external href="https://docs.pancakeswap.finance/earn/cakepad/faq-partners" />,
            ]}
            i18nTemplate="More details: <br /><0>User FAQ</0> | <1>Partner FAQ</1>"
          />
        </>
      ),
    },
    {
      title: <Trans>What's new in this CAKE.PAD?</Trans>,
      description: (
        <>
          <Trans>
            <ul>
              <li>
                <Text as="span" bold>
                  Participation only requires {symbol}
                </Text>{' '}
                – no staking or NFT profile needed.
              </li>
              <li>
                <Text as="span" bold>
                  Tiered fee structure
                </Text>{' '}
                replaces flat fees – fees only apply if oversubscribed.
              </li>
              <li>
                <Text as="span" bold>
                  iCAKE / veCAKE not used
                </Text>
                .
              </li>
            </ul>
          </Trans>
          <br />
          <Trans
            components={[
              <InlineLink
                key="tokenomics"
                external
                href="https://pancakeswap.finance/voting/proposal/0x79ef496c9737e48d9677a6e291ff2a549dee6729c9996398e453af8ecbf0ceb3"
              />,
              <InlineLink key="guide" external href="https://docs.pancakeswap.finance/earn/cakepad/cakepad-guide" />,
            ]}
            i18nTemplate="Reference: <0>Tokenomics 3.0</0> and <1>User Guide</1>"
          />
        </>
      ),
    },
    {
      title: <Trans>How can I participate?</Trans>,
      description: (
        <>
          <Trans>
            <ol>
              <li>
                <Text as="span" bold>
                  Get {symbol}
                </Text>
              </li>
              <li>
                <Text as="span" bold>
                  Commit {symbol}
                </Text>{' '}
                during the CAKE.PAD via the CAKE.PAD page.
              </li>
              <li>
                <Text as="span" bold>
                  Claim your tokens
                </Text>{' '}
                after the CAKE.PAD ends.
              </li>
            </ol>
          </Trans>
          <Box mt="1rem">
            <Trans
              components={[<InlineLink external href="https://docs.pancakeswap.finance/earn/cakepad/cakepad-guide" />]}
              i18nTemplate="More info: <0>User Guide</0>"
            />
          </Box>
        </>
      ),
    },
    {
      title: <Trans>Are there participation fees?</Trans>,
      description: (
        <>
          <Trans>
            <ul>
              <li>
                <Text as="span" bold>
                  Only if the CAKE.PAD is oversubscribed
                </Text>
                .
              </li>
              <li>
                Fee is applied to{' '}
                <Text as="span" bold>
                  excess {symbol}
                </Text>{' '}
                that didn't contribute to your allocation.
              </li>
              <li>
                Tiered from{' '}
                <Text as="span" bold>
                  1% down to 0.05%
                </Text>{' '}
                depending on oversubscription.
              </li>
            </ul>
          </Trans>
          <Box mt="1rem">
            <Trans
              components={[
                <InlineLink
                  external
                  href="https://docs.pancakeswap.finance/earn/cakepad/how-cake.pad-taxes-work-in-overflow-sales-with-example"
                />,
              ]}
              i18nTemplate="Reference: <0>Fee Table</0>"
            />
          </Box>
        </>
      ),
    },
    {
      title: <Trans>Where does the participation fee go?</Trans>,
      description: (
        <>
          <Trans>
            <ul>
              <li>
                <Text as="span" bold>
                  100% of fees are burned
                </Text>{' '}
                as $CAKE.
              </li>
              <li>
                <Text as="span" bold>
                  The CAKE.PAD project receives 100% of the target raise
                </Text>
                .
              </li>
            </ul>
          </Trans>
        </>
      ),
    },
    {
      title: <Trans>How many tokens will I get?</Trans>,
      description: (
        <>
          <Text as="span" bold>
            <Trans>Allocation Rules:</Trans>{' '}
          </Text>
          <Trans>
            Based on an allocation % based on your committed {symbol} vs total {symbol} committed by all users.
          </Trans>
          <Box mt="1rem">
            <Text as="span" bold>
              <Trans>Overflow Sale:</Trans>
            </Text>
          </Box>
          <Trans>
            <ul>
              <li>Users get proportional allocation.</li>
              <li>Any excess {symbol} is refunded (minus participation tax if oversubscribed).</li>
            </ul>
          </Trans>
          <Box mt="1rem">
            <Trans
              components={[
                <InlineLink
                  external
                  href="https://docs.pancakeswap.finance/earn/cakepad/how-cake.pad-taxes-work-in-overflow-sales-with-example"
                />,
              ]}
              i18nTemplate="Reference: <0>Overflow & Allocation Example</0>"
            />
          </Box>
        </>
      ),
    },
    {
      title: <Trans>Are there token vesting schedules?</Trans>,
      description: (
        <ul>
          <li>
            <Trans>
              Supported but{' '}
              <Text as="span" bold>
                current CAKE.PAD events run without lockup.
              </Text>
            </Trans>
          </li>
          <li>
            <Trans>If vesting applies, it will be shown on the CAKE.PAD page with a schedule.</Trans>
          </li>
        </ul>
      ),
    },
    {
      title: <Trans>[Partners] How do I apply for an CAKE.PAD Event?</Trans>,
      description: (
        <>
          <Trans
            components={[
              <InlineLink
                external
                href="https://docs.google.com/forms/d/e/1FAIpQLScmZu87SG41J_eGfzlbyJ_olFohlGOXfOJer04Dr1yCEJy2NA/viewform"
              />,
            ]}
            i18nTemplate="Fill out the <0>Application Form</0>"
          />
          <br />
          <Trans>
            <p>Steps after application:</p>
          </Trans>
          <Trans>
            <ol>
              <li>PancakeSwap team reviews and may conduct further due diligence.</li>
              <li>Align on tokenomics, marketing, and launch timeline.</li>
              <li>Marketing and community onboarding begins.</li>
              <li>Launch CAKE.PAD Event</li>
            </ol>
          </Trans>
          <Box mt="1rem">
            <Trans
              components={[
                <InlineLink external href="https://pancakeswap.notion.site/cakepad" />,
                <InlineLink external href="https://docs.pancakeswap.finance/earn/cakepad/faq-partners" />,
              ]}
              i18nTemplate="For more info: <0>CAKE.PAD Partner Terms</0> | <1>Partner FAQ</1>"
            />
          </Box>
        </>
      ),
    },
  ]

  return (
    <Container>
      <Card mt="24px" style={{ maxWidth: '800px' }} mx="auto">
        <StyledCardHeader>
          <StyledHeading>
            <Trans>FAQ</Trans>
          </StyledHeading>
        </StyledCardHeader>
        <CardBody>
          {faqs.map(({ title, description }, i, { length }) => (
            <FoldableText key={i} mb={i + 1 === length ? '' : '24px'} title={title}>
              <Text color="textSubtle" as="div">
                {description}
              </Text>
            </FoldableText>
          ))}
        </CardBody>
      </Card>
    </Container>
  )
}

export default DefaultQuestions
