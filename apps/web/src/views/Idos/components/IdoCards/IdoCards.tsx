import type { ChainId } from '@pancakeswap/chains'
import { useTranslation } from '@pancakeswap/localization'
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  CheckmarkIcon,
  FlexGap,
  InfoIcon,
  SwapLoading,
  Text,
  useTooltip,
} from '@pancakeswap/uikit'
import getTimePeriods from '@pancakeswap/utils/getTimePeriods'
import { CurrencyLogo } from '@pancakeswap/widgets-internal'
import ConnectW3WButton from 'components/ConnectW3WButton'
import dayjs from 'dayjs'
import { useStablecoinPriceAmount } from 'hooks/useStablecoinPrice'
import useTheme from 'hooks/useTheme'
import { styled } from 'styled-components'
import { useAccount } from 'wagmi'

import { getBannerUrl, getTempBannerUrl } from '../../helpers'
import { useIDOClaimCallback } from '../../hooks/ido/useIDOClaimCallback'
import type { IDOPublicData } from '../../hooks/ido/useIdoPublicData'
import { Footer } from '../Footer'
import { IdoDepositButton, formatDollarAmount } from './IdoDespositButton'
import { IdoRibbon } from './IdoRibbon'
import { PreSaleEligibleCard, PreSaleInfoCard } from './PreSaleInfoCard'

export const StyledCardBody = styled(CardBody)`
  padding: 24px 16px;
  ${({ theme }) => theme.mediaQueries.md} {
    padding: 24px;
  }
`

const Header = styled(CardHeader)<{ ifoId: string; $isCurrent?: boolean }>`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: ${({ $isCurrent }) => ($isCurrent ? '64px' : '112px')};
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  border-top-left-radius: 32px;
  border-top-right-radius: 32px;
  background-color: ${({ theme }) => theme.colors.dropdown};
  /* background-image: ${({ ifoId }) => `url('${getBannerUrl(ifoId)}')`}; */
  background-image: url('${getTempBannerUrl()}');
`

export const Divider = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${({ theme }) => theme.colors.cardBorder};
  margin: 8px 0 0 0;
`

export const IDoCurrentCard = ({
  idoPublicData,
  chainId,
  idoId,
}: {
  idoPublicData: IDOPublicData
  chainId: ChainId
  idoId: string
}) => {
  return (
    <Card style={{ width: '100%' }}>
      <Box className="sticky-header" position="sticky" bottom="48px" width="100%" zIndex={6}>
        <Header $isCurrent ifoId={idoId} />
        <IdoRibbon
          ifoId={idoId}
          startTime={idoPublicData.startTime}
          plannedStartTime={idoPublicData.plannedStartTime}
          timeProgress={idoPublicData.timeProgress}
          ifoStatus={idoPublicData.status}
          ifoChainId={chainId}
          endTime={idoPublicData.endTime}
          hasUserStaked={idoPublicData.userStakedAmount?.greaterThan(0)}
          isClaimed={idoPublicData.userClaimed}
        />
        <IdoCard idoPublicData={idoPublicData} />
      </Box>
      <Footer tokenSymbol={idoPublicData?.offeringCurrency?.symbol} />
    </Card>
  )
}

export const IdoCard: React.FC<{ idoPublicData: IDOPublicData }> = ({ idoPublicData }) => {
  return (
    <CardBody>
      <IdoSaleInfoCard idoPublicData={idoPublicData} />
      <IdoStakeActionCard idoPublicData={idoPublicData} />
    </CardBody>
  )
}

export const IdoSaleInfoCard: React.FC<{ idoPublicData: IDOPublicData }> = ({ idoPublicData }) => {
  const { t } = useTranslation()
  const { theme, isDark } = useTheme()

  return (
    <Card background={isDark ? '#18171A' : theme.colors.background} mb="16px">
      <CardBody>
        <FlexGap gap="8px">
          {/* @ts-ignore */}
          <CurrencyLogo size="40px" currency={idoPublicData?.offeringCurrency} />
          <FlexGap flexDirection="column">
            <Text fontSize="12px" bold color="secondary" lineHeight="18px" textTransform="uppercase">
              {t('Total Sale')}
            </Text>
            <Text bold fontSize="20px" lineHeight="30px">
              {idoPublicData.saleAmount?.toSignificant(6)} {idoPublicData.offeringCurrency?.symbol}
            </Text>
          </FlexGap>
        </FlexGap>
        <FlexGap flexDirection="column" gap="8px">
          <FlexGap justifyContent="space-between">
            <Text color="textSubtle">{t('Project Duration')}</Text>
            <Text>
              {idoPublicData.status !== 'finished' ? (
                <>
                  {getTimePeriods(idoPublicData.duration).days +
                    (getTimePeriods(idoPublicData.duration).days < 1 ? 1 : 0)}{' '}
                  {t('days')}
                </>
              ) : (
                <>
                  {dayjs.unix(idoPublicData.startTime).format('DD-MM-YYYY')} {t('to')}{' '}
                  {dayjs.unix(idoPublicData.endTime).format('DD-MM-YYYY')}
                </>
              )}
            </Text>
          </FlexGap>
        </FlexGap>
        {idoPublicData.status !== 'finished' && (
          <Text color="textSubtle" mt="16px">
            {/* {t('You can subscribe to the sale by depositing BNB and CAKE half in ratio.')} */}
            {t('You can subscribe to the sale by depositing BNB.')}
          </Text>
        )}
      </CardBody>
    </Card>
  )
}

export const IdoStakeActionCard: React.FC<{ idoPublicData: IDOPublicData }> = ({ idoPublicData }) => {
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const userHasStaked = idoPublicData?.userStakedAmount?.greaterThan(0)
  const { theme, isDark } = useTheme()
  const { targetRef, tooltip, tooltipVisible } = useTooltip(
    t('This sale has been oversubscribed. You will get partial refund of the deposit.'),
    {
      placement: 'top',
    },
  )
  return (
    <Card background={isDark ? '#18171A' : theme.colors.background}>
      <CardBody>
        <FlexGap flexDirection="column" gap="8px">
          {idoPublicData.status === 'finished' ? (
            <ClaimDisplay idoPublicData={idoPublicData} />
          ) : userHasStaked ? (
            <StakedDisplay idoPublicData={idoPublicData} />
          ) : (
            <FlexGap flexDirection="column" gap="8px">
              <Text fontSize="12px" bold color="secondary" lineHeight="18px" textTransform="uppercase">
                {idoPublicData.stakeCurrency?.symbol} {t('Pool')}
              </Text>
              <FlexGap gap="8px">
                {/* @ts-ignore */}
                <CurrencyLogo size="40px" currency={idoPublicData?.stakeCurrency} />
                {account ? (
                  idoPublicData?.status === 'coming_soon' ? (
                    <PreSaleEligibleCard />
                  ) : (
                    <IdoDepositButton type="deposit" idoPublicData={idoPublicData} />
                  )
                ) : idoPublicData?.status === 'coming_soon' ? (
                  <PreSaleInfoCard />
                ) : (
                  <ConnectW3WButton width="100%" />
                )}
              </FlexGap>
            </FlexGap>
          )}
          {userHasStaked && <Divider />}
          <FlexGap justifyContent="space-between" mt="8px">
            <Text color="textSubtle">
              {t('Sale Price per')} {idoPublicData?.offeringCurrency?.symbol ?? ''}
            </Text>
            <Text>
              {idoPublicData.pricePerToken?.toSignificant(6)} {idoPublicData.stakeCurrency?.symbol ?? ''}
            </Text>
          </FlexGap>
          <FlexGap justifyContent="space-between">
            <Text color="textSubtle">{t('Target Raise')}</Text>
            <Text>
              {idoPublicData.raiseAmount?.toSignificant(6)} {idoPublicData.stakeCurrency?.symbol ?? ''}
            </Text>
          </FlexGap>
          {(idoPublicData.status === 'live' || idoPublicData.status === 'finished') && (
            <>
              <FlexGap justifyContent="space-between">
                <Text color="textSubtle">{t('Total committed')}</Text>
                <Text>
                  {idoPublicData?.currentStakedAmount?.toSignificant(6)} {idoPublicData.stakeCurrency?.symbol ?? ''}
                </Text>
              </FlexGap>
              <FlexGap justifyContent="space-between">
                <Text color="textSubtle">{t('Status')}</Text>
                <FlexGap flexDirection="column" alignItems="flex-end">
                  <FlexGap gap="3px">
                    <Text>
                      {idoPublicData.progress.toFixed(2)} % {idoPublicData.progress.greaterThan(1) && '🎉'}
                    </Text>
                  </FlexGap>
                  {idoPublicData.progress.greaterThan(1) && (
                    <FlexGap gap="3px">
                      <Text>{t('Oversubscribed')}</Text>
                      <FlexGap ref={targetRef}>
                        <InfoIcon width="14px" color="textSubtle" />
                        {tooltipVisible && tooltip}
                      </FlexGap>
                    </FlexGap>
                  )}
                </FlexGap>
              </FlexGap>
            </>
          )}
        </FlexGap>
      </CardBody>
    </Card>
  )
}

export const StakedDisplay: React.FC<{ idoPublicData: IDOPublicData }> = ({ idoPublicData }) => {
  const { t } = useTranslation()
  const stakedAmount = idoPublicData?.userStakedAmount

  const amountInDollar = useStablecoinPriceAmount(
    idoPublicData?.stakeCurrency ?? undefined,
    stakedAmount !== undefined && Number.isFinite(+stakedAmount.toSignificant(6))
      ? +stakedAmount.toSignificant(6)
      : undefined,
    {
      hideIfPriceImpactTooHigh: true,
      enabled: Boolean(stakedAmount !== undefined && Number.isFinite(+stakedAmount.toSignificant(6))),
    },
  )
  return (
    <FlexGap gap="8px" justifyContent="space-between" alignItems="center">
      <FlexGap flexDirection="column">
        <FlexGap gap="8px" alignItems="center">
          {/* @ts-ignore */}
          <CurrencyLogo size="24px" currency={idoPublicData?.stakeCurrency} />
          <Text fontSize="12px" bold color="secondary" lineHeight="18px" textTransform="uppercase">
            {idoPublicData.stakeCurrency?.symbol} {t('Pool')} {t('Deposited')}
          </Text>
        </FlexGap>
        <FlexGap gap="8px" flexDirection="column">
          <Text fontSize="20px" bold lineHeight="30px">
            {stakedAmount?.toSignificant(6)}
          </Text>
          <FlexGap>
            {Number.isFinite(amountInDollar) ? (
              <>
                <Text fontSize="14px" color="textSubtle" ellipsis>
                  {`~${amountInDollar && formatDollarAmount(amountInDollar)}`}
                </Text>
                <Text ml="4px" fontSize="14px" color="textSubtle">
                  USD
                </Text>
              </>
            ) : null}
          </FlexGap>
        </FlexGap>
      </FlexGap>
      <IdoDepositButton idoPublicData={idoPublicData} type="add" />
    </FlexGap>
  )
}

export const ClaimDisplay: React.FC<{ idoPublicData: IDOPublicData }> = ({ idoPublicData }) => {
  const { t } = useTranslation()
  const { claim, isPending: isLoading } = useIDOClaimCallback()
  const claimableAmount = idoPublicData?.userClaimableAmount?.toSignificant(6)
  const amountInDollar = useStablecoinPriceAmount(
    idoPublicData?.offeringCurrency ?? undefined,
    claimableAmount !== undefined && Number.isFinite(+claimableAmount) ? +claimableAmount : undefined,
    {
      hideIfPriceImpactTooHigh: true,
      enabled: Boolean(claimableAmount !== undefined && Number.isFinite(+claimableAmount)),
    },
  )
  const refundAmount = idoPublicData?.userStakedRefund?.toSignificant(6)
  const hasRefund = idoPublicData?.userStakedRefund?.greaterThan(0)

  const refundInDollar = useStablecoinPriceAmount(
    idoPublicData?.stakeCurrency ?? undefined,
    refundAmount !== undefined && Number.isFinite(+refundAmount) ? +refundAmount : undefined,
    {
      hideIfPriceImpactTooHigh: true,
      enabled: Boolean(refundAmount !== undefined && Number.isFinite(+refundAmount)),
    },
  )

  const userHasStaked = idoPublicData?.userStakedAmount?.greaterThan(0)

  const { targetRef, tooltip, tooltipVisible } = useTooltip(
    t(
      'When the sale is oversubscribed, deposit that were not used is being refunded. You may withdraw together when claiming.',
    ),
    {
      placement: 'top',
    },
  )
  const userClaimed = idoPublicData?.userClaimed

  const { isDark } = useTheme()
  const { address: account } = useAccount()
  return (
    <>
      {userHasStaked ? (
        <FlexGap flexDirection="column" gap="8px">
          <FlexGap gap="8px" justifyContent="space-between" alignItems="center">
            <FlexGap flexDirection="column">
              <FlexGap gap="8px" alignItems="center">
                {/* @ts-ignore */}
                <CurrencyLogo size="24px" currency={idoPublicData?.stakeCurrency} />
                <Text fontSize="12px" bold color="secondary" lineHeight="18px" textTransform="uppercase">
                  {idoPublicData.stakeCurrency?.symbol} {t('Pool')}
                </Text>
              </FlexGap>
              <FlexGap flexDirection="column" mt="8px">
                <Text textTransform="uppercase" color="secondary" fontSize="12px" bold>
                  {idoPublicData?.offeringCurrency?.symbol} {t('allocated')}
                </Text>
                <Text fontSize="20px" bold lineHeight="30px">
                  {claimableAmount}
                </Text>
                <FlexGap>
                  {Number.isFinite(amountInDollar) ? (
                    <>
                      <Text fontSize="14px" color="textSubtle" ellipsis>
                        {`~${amountInDollar && formatDollarAmount(amountInDollar)}`}
                      </Text>
                      <Text ml="4px" fontSize="14px" color="textSubtle">
                        USD
                      </Text>
                    </>
                  ) : null}
                </FlexGap>
              </FlexGap>
            </FlexGap>
            <Button
              onClick={() => {
                if (!userClaimed) claim(0)
              }}
              width={userClaimed ? '48px' : undefined}
              variant={userClaimed ? 'success' : undefined}
              isLoading={isLoading}
            >
              {userClaimed ? (
                <CheckmarkIcon color={isDark ? '#000000' : '#FFFFFF'} />
              ) : (
                <>
                  {t('Claim')} {isLoading ? <SwapLoading ml="3px" /> : null}
                </>
              )}
            </Button>
          </FlexGap>
          <FlexGap justifyContent="space-between" mt="8px">
            <Text color="textSubtle">{t('Subscribed')}</Text>
            <Text>
              {idoPublicData.userStakedAmount?.toSignificant(6)} {idoPublicData.stakeCurrency?.symbol ?? ''}
            </Text>
          </FlexGap>
          {hasRefund && (
            <FlexGap justifyContent="space-between" alignItems="flex-start">
              <FlexGap gap="3px" alignItems="center">
                <Text color="textSubtle">{t('Refund')}</Text>
                <FlexGap ref={targetRef}>
                  <InfoIcon width="14px" color="textSubtle" />
                  {tooltipVisible && tooltip}
                </FlexGap>
              </FlexGap>
              <FlexGap flexDirection="column" alignItems="flex-end">
                <Text>
                  {idoPublicData.userStakedRefund?.toSignificant(6)} {idoPublicData.stakeCurrency?.symbol ?? ''}
                </Text>
                <FlexGap>
                  {Number.isFinite(refundInDollar) ? (
                    <>
                      <Text fontSize="14px" color="textSubtle" ellipsis>
                        {`~${refundInDollar && formatDollarAmount(refundInDollar)}`}
                      </Text>
                      <Text ml="4px" fontSize="14px" color="textSubtle">
                        USD
                      </Text>
                    </>
                  ) : null}
                </FlexGap>
              </FlexGap>
            </FlexGap>
          )}
        </FlexGap>
      ) : (
        <FlexGap flexDirection="column" gap="8px">
          <Text fontSize="12px" bold color="secondary" lineHeight="18px" textTransform="uppercase">
            {idoPublicData.stakeCurrency?.symbol} {t('Pool')}
          </Text>
          <FlexGap gap="8px" alignItems="center">
            {/* @ts-ignore */}
            <CurrencyLogo size="40px" currency={idoPublicData?.stakeCurrency} />
            {!account ? (
              <ConnectW3WButton width="100%" />
            ) : (
              <Text fontSize="16px" color="textDisabled" bold>
                {t('You didn’t deposit')} {idoPublicData?.stakeCurrency?.symbol}
              </Text>
            )}
          </FlexGap>
        </FlexGap>
      )}
    </>
  )
}
