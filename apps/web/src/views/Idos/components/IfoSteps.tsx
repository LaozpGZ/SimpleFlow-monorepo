import { ChainId, Currency, CurrencyAmount } from '@pancakeswap/sdk'
import {
  Balance,
  Box,
  Button,
  Card,
  CardBody,
  CheckmarkIcon,
  Container,
  Flex,
  FlexGap,
  Heading,
  Step,
  StepStatus,
  Stepper,
  Text,
} from '@pancakeswap/uikit'
import { NextLinkFromReactRouter as RouterLink } from '@pancakeswap/widgets-internal'
import every from 'lodash/every'
import { ReactNode, useMemo } from 'react'
import { styled } from 'styled-components'
import { useAccount } from 'wagmi'

import { useTranslation } from '@pancakeswap/localization'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { useProfile } from 'state/profile/hooks'

import { Address } from 'viem'
import { useChainName } from '../hooks/useChainNames'

interface TypeProps {
  sourceChainIfoCredit?: CurrencyAmount<Currency>
  dstChainIfoCredit?: CurrencyAmount<Currency>
  srcChainId?: ChainId
  ifoChainId?: ChainId
  ifoCurrencyAddress: Address
  hasClaimed: boolean
  isCommitted: boolean
  isLive?: boolean
  isFinished?: boolean
  isCrossChainIfo?: boolean
  hasBridged?: boolean
}

const SmallStakePoolCard = styled(Box)`
  margin-top: 16px;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background-color: ${({ theme }) => theme.colors.background};
`

const Wrapper = styled(Container)`
  margin-left: -16px;
  margin-right: -16px;
  padding-top: 48px;
  padding-bottom: 48px;

  ${({ theme }) => theme.mediaQueries.sm} {
    margin-left: -24px;
    margin-right: -24px;
  }
`

function ICakeCard({
  icon,
  title,
  credit,
  more,
  action,
}: {
  action?: ReactNode
  icon?: ReactNode
  title?: ReactNode
  credit?: CurrencyAmount<Currency>
  more?: ReactNode
}) {
  const balanceNumber = useMemo(() => credit && Number(credit.toExact()), [credit])

  return (
    <SmallStakePoolCard borderRadius="default" p="16px">
      <FlexGap justifyContent="space-between" alignItems="center" flexWrap="wrap" gap="16px">
        <Flex>
          {icon}
          <Box ml="16px">
            <Text bold fontSize="12px" textTransform="uppercase" color="secondary">
              {title}
            </Text>
            <Balance fontSize="20px" bold decimals={5} value={balanceNumber ?? 0} />
            {more}
          </Box>
        </Flex>
        {action}
      </FlexGap>
    </SmallStakePoolCard>
  )
}

const Step1 = ({
  hasProfile,
  sourceChainIfoCredit,
  isCrossChainIfo,
}: {
  srcChainId?: ChainId
  hasProfile: boolean
  sourceChainIfoCredit?: CurrencyAmount<Currency>
  isCrossChainIfo?: boolean
}) => {
  const { t } = useTranslation()

  return (
    <CardBody>
      <Heading as="h4" color="secondary" mb="16px">
        {t('Lock BNB')}
      </Heading>
      <Box>
        <Text mb="4px" color="textSubtle" small>
          {t(
            'Here are the detailed explanations, e.g. Lock _ amount of BNB and you’ll be eligible in the IDO sale for {token$A}.',
          )}
        </Text>
        <Button mt="8px">{t('Lock BNB')}</Button>
      </Box>
    </CardBody>
  )
}

const IfoSteps: React.FC<React.PropsWithChildren<TypeProps>> = ({
  dstChainIfoCredit,
  sourceChainIfoCredit,
  srcChainId,
  ifoChainId,
  isCommitted,
  hasClaimed,
  isLive,
  isFinished,
  isCrossChainIfo,
  hasBridged,
}) => {
  const { hasActiveProfile } = useProfile()
  const { address: account } = useAccount()
  const { t } = useTranslation()
  const ifoChainName = useChainName(ifoChainId)
  const sourceChainHasICake = useMemo(
    () => sourceChainIfoCredit && sourceChainIfoCredit.quotient > 0n,
    [sourceChainIfoCredit],
  )
  const stepsValidationStatus = isCrossChainIfo
    ? [hasActiveProfile, sourceChainHasICake, hasBridged]
    : [hasActiveProfile, sourceChainHasICake, isCommitted]

  const getStatusProp = (index: number): StepStatus => {
    const arePreviousValid = index === 0 ? true : every(stepsValidationStatus.slice(0, index), Boolean)
    if (stepsValidationStatus[index]) {
      return arePreviousValid ? 'past' : 'future'
    }
    return arePreviousValid ? 'current' : 'future'
  }

  const renderCardBody = (step: number) => {
    const isStepValid = stepsValidationStatus[step]

    const renderAccountStatus = () => {
      if (!account) {
        return <ConnectWalletButton />
      }

      if (isStepValid) {
        return (
          <Flex alignItems="center">
            <Text color="success" bold mr="8px">
              {t('Profile Active!')}
            </Text>
            <CheckmarkIcon color="success" />
          </Flex>
        )
      }

      return (
        <Button as={RouterLink} to={`/profile/${account.toLowerCase()}`}>
          {t('Activate your Profile')}
        </Button>
      )
    }

    const claimIDoAirDrop = () => (
      <CardBody>
        <Heading as="h4" color="secondary" mb="16px">
          {t('Claim IDO airdrop')}
        </Heading>
        <Text color="textSubtle" small>
          {t(
            'After the IDO finish, you can claim the amount of {token$A} according to the proportion of your locked BNB.',
          )}
        </Text>
      </CardBody>
    )

    switch (step) {
      case 0:
        return (
          <CardBody>
            <Heading as="h4" color="secondary" mb="16px">
              {t('Connect BN web3 wallet')}
            </Heading>
            <Text color="textSubtle" small mb="16px">
              {t('Here are the detailed explanations if needed.')}
            </Text>
          </CardBody>
        )
      case 1:
        return (
          <Step1
            hasProfile={hasActiveProfile}
            sourceChainIfoCredit={sourceChainIfoCredit}
            srcChainId={srcChainId}
            isCrossChainIfo={isCrossChainIfo}
          />
        )
      case 2:
        return claimIDoAirDrop()
      default:
        return null
    }
  }

  return (
    <Wrapper>
      <Heading id="ifo-how-to" as="h2" scale="xl" color="secondary" mb="24px" textAlign="center">
        {t('How to Take Part')}
      </Heading>
      <Stepper>
        {stepsValidationStatus.map((_, index) => (
          <Step
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            index={index}
            statusFirstPart={getStatusProp(index)}
            statusSecondPart={getStatusProp(index + 1)}
          >
            <Card>{renderCardBody(index)}</Card>
          </Step>
        ))}
      </Stepper>
    </Wrapper>
  )
}

export default IfoSteps
