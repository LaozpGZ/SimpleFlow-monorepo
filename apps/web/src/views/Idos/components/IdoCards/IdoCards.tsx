import { ChainId } from '@pancakeswap/chains'
import { useTranslation } from '@pancakeswap/localization'
import { Percent } from '@pancakeswap/sdk'
import { CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import {
  AddIcon,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  CheckmarkIcon,
  FlexGap,
  InfoIcon,
  LazyAnimatePresence,
  Loading,
  ModalBody,
  ModalContainer,
  ModalV2,
  SwapLoading,
  Text,
  domAnimation,
  useModalV2,
  useTooltip,
} from '@pancakeswap/uikit'
import { formatNumber } from '@pancakeswap/utils/formatBalance'
import { formatAmount } from '@pancakeswap/utils/formatFractions'
import getTimePeriods from '@pancakeswap/utils/getTimePeriods'
import { CurrencyLogo, SwapUIV2 } from '@pancakeswap/widgets-internal'
import BigNumber from 'bignumber.js'
import ConnectWalletButton from 'components/ConnectWalletButton'
import dayjs from 'dayjs'
import { useStablecoinPriceAmount } from 'hooks/useStablecoinPrice'
import useTheme from 'hooks/useTheme'
import { useCallback, useMemo, useState } from 'react'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { styled } from 'styled-components'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { useAccount } from 'wagmi'
import { IdoRibbon } from './IdoRibbon'

import { getBannerUrl, getTempBannerUrl } from '../../helpers'
import { useIDOClaimCallback } from '../../hooks/ido/useIDOClaimCallback'
import { useIDODepositCallback } from '../../hooks/ido/useIDODepositCallback'
import { IDOPublicData } from '../../hooks/ido/useIdoPublicData'
import { Footer } from '../Footer'

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
  ${({ theme }) => theme.mediaQueries.md} {
    height: 112px;
  }
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
                  {getTimePeriods(idoPublicData.duration).days + getTimePeriods(idoPublicData.duration).days < 1
                    ? 1
                    : 0}{' '}
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
    t(
      'When the sale is oversubscribed, deposit that were not used is being refunded. You may withdraw together when claiming.',
    ),
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
                  <IdoDepositButton type="deposit" idoPublicData={idoPublicData} />
                ) : (
                  <ConnectWalletButton width="100%" />
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
                      {idoPublicData.progress.toFixed(2)} % {idoPublicData.progress.greaterThan(1) && <>🎉</>}
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

const formatDollarAmount = (amount: number) => {
  if (amount > 0 && amount < 0.01) {
    return '<0.01'
  }
  return formatNumber(amount)
}

export const IdoDepositButton: React.FC<{ idoPublicData: IDOPublicData; type: 'add' | 'deposit' }> = ({
  idoPublicData,
  type,
}) => {
  const { t } = useTranslation()
  const { onDismiss, onOpen, isOpen } = useModalV2()
  const [value, setValue] = useState('')

  const { address: account } = useAccount()
  const inputBalance = useCurrencyBalance(account ?? undefined, idoPublicData?.stakeCurrency ?? undefined)
  const balance = idoPublicData?.stakeCurrency ? formatAmount(inputBalance, 6) : undefined
  const { deposit, isPending: isLoading } = useIDODepositCallback()

  const maxAmountInput = useMemo(() => maxAmountSpend(inputBalance), [inputBalance])

  const getPercentAmount = useCallback(
    (percent: number) => {
      return maxAmountInput.multiply(new Percent(percent, 100)).toExact()
    },
    [maxAmountInput],
  )

  const handlePercentInput = useCallback(
    (percent: number) => {
      if (maxAmountInput) {
        setValue(getPercentAmount(percent))
      }
    },
    [getPercentAmount, maxAmountInput],
  )

  const handleMaxInput = useCallback(() => {
    if (maxAmountInput) {
      setValue(maxAmountInput.toExact())
    }
  }, [maxAmountInput])
  const tokenBalanceMultiplier = useMemo(
    () => new BigNumber(10).pow(idoPublicData?.stakeCurrency?.decimals ?? 18),
    [idoPublicData?.stakeCurrency?.decimals],
  )
  const depositAmount =
    idoPublicData?.stakeCurrency && value !== ''
      ? CurrencyAmount.fromRawAmount(
          idoPublicData.stakeCurrency,
          new BigNumber(value ?? 0).times(tokenBalanceMultiplier).toFixed(0),
        )
      : undefined

  const isUserInsufficientBalance = useMemo(() => {
    if (depositAmount && inputBalance) {
      return depositAmount.greaterThan(inputBalance)
    }
    return false
  }, [depositAmount, inputBalance])

  const amountInDollar = useStablecoinPriceAmount(
    idoPublicData?.stakeCurrency ?? undefined,
    value !== undefined && Number.isFinite(+value) ? +value : undefined,
    {
      hideIfPriceImpactTooHigh: true,
      enabled: Boolean(value !== undefined && Number.isFinite(+value)),
    },
  )
  const isInputloading = inputBalance === undefined

  return (
    <>
      <Button
        width={type === 'deposit' ? '100%' : undefined}
        onClick={onOpen}
        variant={type === 'add' ? 'secondary' : undefined}
      >
        {type === 'deposit' ? (
          <>
            {t('Deposit')} {idoPublicData?.stakeCurrency?.symbol ?? ''}
          </>
        ) : (
          <AddIcon color="primary" />
        )}
      </Button>
      <ModalV2 isOpen={isOpen} title="Deposit" onDismiss={onDismiss} closeOnOverlayClick>
        <ModalContainer>
          <ModalBody p="16px" pt="30px">
            <FlexGap flexDirection="column" gap="8px">
              <SwapUIV2.CurrencyInputPanelSimplify
                id={`idoStakeCurrency${idoPublicData?.stakeCurrency?.symbol ?? ''}`}
                disabled={false}
                error={idoPublicData.maxStakePerUser && depositAmount?.greaterThan(idoPublicData.maxStakePerUser)}
                value={value}
                placeholder="0.00"
                onUserInput={setValue}
                top={
                  <FlexGap justifyContent="space-between" alignItems="center" width="100%" position="relative">
                    <Text fontSize="12px" bold>
                      {t('Deposit')}
                    </Text>
                    <LazyAnimatePresence mode="wait" features={domAnimation}>
                      {account ? (
                        <SwapUIV2.WalletAssetDisplay
                          isUserInsufficientBalance={isUserInsufficientBalance}
                          balance={balance}
                          onMax={handleMaxInput}
                        />
                      ) : null}
                    </LazyAnimatePresence>
                  </FlexGap>
                }
                inputLeft={
                  <FlexGap alignItems="center">
                    {/* @ts-ignore */}
                    <CurrencyLogo size="40px" currency={idoPublicData?.stakeCurrency} />
                  </FlexGap>
                }
                bottom={
                  isInputloading || Number.isFinite(amountInDollar) ? (
                    <Box position="absolute" bottom="12px" right="0px">
                      <FlexGap justifyContent="flex-end" mr="1rem">
                        <FlexGap maxWidth={['120px', '160px', '200px', '240px']}>
                          {isInputloading ? (
                            <Loading width="14px" height="14px" />
                          ) : Number.isFinite(amountInDollar) ? (
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
                    </Box>
                  ) : null
                }
              />
              {idoPublicData.maxStakePerUser && depositAmount?.greaterThan(idoPublicData.maxStakePerUser) && (
                <Text color="failure">{t('Max stake per user exceeded')}</Text>
              )}
              <FlexGap>
                {maxAmountInput?.greaterThan(0) &&
                  [25, 50, 75, 100].map((percent) => {
                    const isAtCurrentPercent = maxAmountInput && value !== '0' && value === getPercentAmount(percent)
                    return (
                      <Button
                        key={`btn_quickCurrency${percent}`}
                        data-dd-action-name={`Balance percent ${percent}`}
                        onClick={() => {
                          handlePercentInput(percent)
                        }}
                        scale="sm"
                        mr="5px"
                        width="100%"
                        variant={isAtCurrentPercent ? 'primary' : 'secondary'}
                        style={{ textTransform: 'uppercase' }}
                      >
                        {percent === 100 ? t('Max') : `${percent}%`}
                      </Button>
                    )
                  })}
              </FlexGap>
              <FlexGap flexDirection="column" gap="8px">
                <FlexGap justifyContent="space-between">
                  <Text color="textSubtle">{t('Project Duration')}</Text>
                  <Text>
                    {getTimePeriods(idoPublicData.duration).days + getTimePeriods(idoPublicData.duration).days < 1
                      ? 1
                      : 0}{' '}
                    {t('days')}
                  </Text>
                </FlexGap>
                <FlexGap justifyContent="space-between">
                  <Text color="textSubtle">{t('Max. stake per user')}</Text>
                  <Text>
                    {idoPublicData.maxStakePerUser?.toSignificant(6)} {idoPublicData.stakeCurrency?.symbol ?? ''}
                  </Text>
                </FlexGap>
                <Text color="textSubtle" fontSize="12px">
                  {t(
                    'Some Rules/ T&C context or information that user need to know before locking BNB/ participating in IDO, show here.',
                  )}
                </Text>
                <Button
                  disabled={
                    value === '' ||
                    !depositAmount ||
                    isUserInsufficientBalance ||
                    (idoPublicData.maxStakePerUser && depositAmount.greaterThan(idoPublicData.maxStakePerUser))
                  }
                  width="100%"
                  isLoading={isLoading}
                  onClick={() => {
                    if (depositAmount)
                      deposit(0, depositAmount, () => {
                        onDismiss()
                      })
                  }}
                >
                  {t('Confirm Deposit')} {isLoading ? <SwapLoading ml="3px" /> : null}
                </Button>
              </FlexGap>
            </FlexGap>
          </ModalBody>
        </ModalContainer>
      </ModalV2>
    </>
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
  const claimableAmount = idoPublicData?.userClaimableAmount
  const amountInDollar = useStablecoinPriceAmount(
    idoPublicData?.stakeCurrency ?? undefined,
    claimableAmount !== undefined && Number.isFinite(+claimableAmount) ? +claimableAmount : undefined,
    {
      hideIfPriceImpactTooHigh: true,
      enabled: Boolean(claimableAmount !== undefined && Number.isFinite(+claimableAmount)),
    },
  )
  const refundAmount = idoPublicData?.userStakedRefund
  const hasRefund = refundAmount?.greaterThan(0)

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
    t('This sale has been oversubscribed. You will get partial refund of the deposit.'),
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
                <Text fontSize="12px" bold color="secondary" lineHeight="18px">
                  {idoPublicData.stakeCurrency?.symbol} {t('Pool')}
                </Text>
              </FlexGap>
              <FlexGap gap="8px" flexDirection="column" mt="8px">
                <Text textTransform="uppercase" color="secondary" fontSize="12px" bold>
                  {idoPublicData?.offeringCurrency?.symbol} {t('allocated')}
                </Text>
                <Text fontSize="20px" bold lineHeight="30px">
                  {claimableAmount?.toSignificant(6)}
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
            <FlexGap justifyContent="space-between">
              <FlexGap gap="3px" alignItems="center">
                <Text color="textSubtle">{t('Refund')}</Text>
                <FlexGap ref={targetRef}>
                  <InfoIcon width="14px" color="textSubtle" />
                  {tooltipVisible && tooltip}
                </FlexGap>
              </FlexGap>
              <FlexGap gap="8px" flexDirection="column">
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
              <ConnectWalletButton width="100%" />
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
