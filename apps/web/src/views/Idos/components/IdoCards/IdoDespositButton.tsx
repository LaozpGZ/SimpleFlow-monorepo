import { useTranslation } from '@pancakeswap/localization'
import { Percent } from '@pancakeswap/sdk'
import { CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import {
  AddIcon,
  Box,
  Button,
  Flex,
  FlexGap,
  Heading,
  Image,
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
import { useStablecoinPriceAmount } from 'hooks/useStablecoinPrice'
import { useCallback, useMemo, useRef, useState } from 'react'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { useAccount } from 'wagmi'

import { getIsAndroid, isInBinance } from '@binance/w3w-utils'
import { ASSET_CDN } from 'config/constants/endpoints'
import { useW3WAccountVerify } from 'views/Idos/hooks/w3w/useW3WAccountVerify'
import { useIDODepositCallback } from '../../hooks/ido/useIDODepositCallback'
import type { IDOPublicData } from '../../hooks/ido/useIdoPublicData'

export const formatDollarAmount = (amount: number) => {
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
  const { isOpen: isUnverifiedOpen, onOpen: onUnverifiedOpen, onDismiss: onUnverifiedDismiss } = useModalV2()
  const [value, setValue] = useState('')
  const isAndroid = getIsAndroid()
  const isBinance = isInBinance()

  const { address: account } = useAccount()
  const inputBalance = useCurrencyBalance(account ?? undefined, idoPublicData?.stakeCurrency ?? undefined)
  const balance = idoPublicData?.stakeCurrency ? formatAmount(inputBalance, 6) : undefined
  const { deposit, isPending: isLoading } = useIDODepositCallback()

  const maxAmountInput = useMemo(() => maxAmountSpend(inputBalance), [inputBalance])

  const getPercentAmount = useCallback(
    (percent: number) => {
      return maxAmountInput.multiply(new Percent(percent, 100))
    },
    [maxAmountInput],
  )

  const handlePercentInput = useCallback(
    (percent: number) => {
      if (maxAmountInput) {
        const percentAmount = getPercentAmount(percent)
        if (
          idoPublicData?.userStakedAmount &&
          idoPublicData?.maxStakePerUser &&
          !idoPublicData.maxStakePerUser.equalTo(0) &&
          percentAmount.greaterThan(idoPublicData?.maxStakePerUser.subtract(idoPublicData?.userStakedAmount))
        ) {
          setValue(idoPublicData?.maxStakePerUser.subtract(idoPublicData?.userStakedAmount).toExact())
        } else setValue(percentAmount.toExact())
      }
    },
    [getPercentAmount, maxAmountInput, idoPublicData],
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

  const totalDepositedAmount = idoPublicData?.stakeCurrency
    ? CurrencyAmount.fromRawAmount(idoPublicData.stakeCurrency, idoPublicData.userStakedAmount?.quotient ?? 0).add(
        CurrencyAmount.fromRawAmount(idoPublicData.stakeCurrency, depositAmount?.quotient ?? 0),
      )
    : undefined

  const maxDepositExceeded = useMemo(() => {
    return (
      idoPublicData.maxStakePerUser &&
      !idoPublicData.maxStakePerUser.equalTo(0) &&
      (totalDepositedAmount?.greaterThan(idoPublicData.maxStakePerUser) ||
        totalDepositedAmount?.equalTo(idoPublicData.maxStakePerUser))
    )
  }, [idoPublicData.maxStakePerUser, totalDepositedAmount])

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

  const { isVerified } = useW3WAccountVerify()

  const disabled = useMemo(() => {
    return maxDepositExceeded || isUserInsufficientBalance
  }, [maxDepositExceeded, isUserInsufficientBalance])

  const handleDeposit = useCallback(() => {
    if (isVerified) {
      onOpen()
    } else {
      onUnverifiedOpen()
    }
  }, [isVerified, onOpen, onUnverifiedOpen])

  const { targetRef, tooltip } = useTooltip(
    <Text>
      {t(
        'Please choose a Binance keyless wallet. If you do not have one, go to Binance wallet management page to create one. ',
      )}
    </Text>,
    {
      placement: 'top-end',
      manualVisible: isUnverifiedOpen,
    },
  )

  const inputRef = useRef<HTMLDivElement>(null)

  const [minHeight, setMinHeight] = useState<string | undefined>(undefined)

  const handleInputFocus = useCallback(() => {
    if (inputRef.current) {
      inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      if (isAndroid && isBinance) {
        setMinHeight('calc(100vh - 120px)')
      }
    }
  }, [isAndroid, isBinance])

  const handleCloseModal = useCallback(() => {
    onDismiss()
    setValue('')
  }, [onDismiss])

  return (
    <>
      <Button
        width={type === 'deposit' ? '100%' : undefined}
        onClick={handleDeposit}
        disabled={disabled}
        variant={type === 'add' ? 'secondary' : undefined}
      >
        {type === 'deposit' ? (
          <>
            {t('Deposit')} {idoPublicData?.stakeCurrency?.symbol ?? ''}
          </>
        ) : (
          <AddIcon color={maxDepositExceeded ? 'textDisabled' : 'primary'} />
        )}
      </Button>
      <ModalV2 isOpen={isOpen} title="Deposit" onDismiss={handleCloseModal} closeOnOverlayClick>
        <ModalContainer minHeight={minHeight}>
          <ModalBody p="16px" pt="30px" style={{ overflowY: 'scroll' }}>
            <FlexGap flexDirection="column" gap="8px" ref={inputRef}>
              <SwapUIV2.CurrencyInputPanelSimplify
                id={`idoStakeCurrency${idoPublicData?.stakeCurrency?.symbol ?? ''}`}
                disabled={false}
                error={
                  idoPublicData.maxStakePerUser &&
                  depositAmount?.greaterThan(idoPublicData.maxStakePerUser) &&
                  !idoPublicData.maxStakePerUser.equalTo(0)
                }
                value={value}
                placeholder="0.00"
                onInputFocus={handleInputFocus}
                onInputBlur={() => setMinHeight(undefined)}
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
              {idoPublicData.maxStakePerUser &&
                !idoPublicData.maxStakePerUser.equalTo(0) &&
                totalDepositedAmount?.greaterThan(idoPublicData.maxStakePerUser) && (
                  <Text color="failure">{t('Max stake per user exceeded')}</Text>
                )}
              <FlexGap>
                {maxAmountInput?.greaterThan(0) &&
                  [25, 50, 75, 100].map((percent) => {
                    const isAtCurrentPercent =
                      maxAmountInput && value !== '0' && value === getPercentAmount(percent).toExact()
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
                    {getTimePeriods(idoPublicData.duration).days +
                      (getTimePeriods(idoPublicData.duration).days < 1 ? 1 : 0)}{' '}
                    {t('days')}
                  </Text>
                </FlexGap>
                {idoPublicData.maxStakePerUser && !idoPublicData.maxStakePerUser.equalTo(0) && (
                  <FlexGap justifyContent="space-between">
                    <Text color="textSubtle">{t('Max. stake per user')}</Text>
                    <Text>
                      {idoPublicData.maxStakePerUser?.toSignificant(6)} {idoPublicData.stakeCurrency?.symbol ?? ''}
                    </Text>
                  </FlexGap>
                )}
                {idoPublicData.userStakedAmount?.greaterThan(0) ? (
                  <FlexGap justifyContent="space-between">
                    <Text color="textSubtle">{t('Subscribed')}</Text>
                    <Text>
                      {idoPublicData.userStakedAmount?.toSignificant(6)} {idoPublicData.stakeCurrency?.symbol ?? ''}
                    </Text>
                  </FlexGap>
                ) : null}
                <Text color="textSubtle" fontSize="12px">
                  {t(
                    'Some Rules/ T&C context or information that user need to know before locking BNB/ participating in IDO, show here.',
                  )}
                </Text>
                <Button
                  disabled={
                    value === '' ||
                    !depositAmount ||
                    depositAmount.equalTo(0) ||
                    isUserInsufficientBalance ||
                    (idoPublicData.maxStakePerUser &&
                      !idoPublicData.maxStakePerUser.equalTo(0) &&
                      totalDepositedAmount?.greaterThan(idoPublicData.maxStakePerUser))
                  }
                  width="100%"
                  isLoading={isLoading}
                  onClick={() => {
                    if (depositAmount) deposit(0, depositAmount, handleCloseModal)
                  }}
                >
                  {t('Confirm Deposit')} {isLoading ? <SwapLoading ml="3px" /> : null}
                </Button>
              </FlexGap>
            </FlexGap>
          </ModalBody>
        </ModalContainer>
      </ModalV2>
      <ModalV2 isOpen={isUnverifiedOpen} title="" onDismiss={onUnverifiedDismiss} closeOnOverlayClick>
        <>
          <Box style={{ position: 'fixed', right: '10px', top: '0' }} width="5px" height="5px" ref={targetRef} />
          {tooltip}
        </>
        <ModalContainer>
          <ModalBody p="16px" pt="30px">
            <Heading textAlign="center" fontSize="20px" bold mb="16px">
              {t('Binance Keyless Wallet')}
            </Heading>
            <FlexGap flexDirection="column" gap="16px">
              <Flex justifyContent="center">
                <Image src={`${ASSET_CDN}/web/wallets/binance-w3w.png`} width={40} height={40} />
              </Flex>
              <Text>{t('This IDO subscription is exclusively available using the Binance Keyless Wallet.')}</Text>
            </FlexGap>
          </ModalBody>
        </ModalContainer>
      </ModalV2>
    </>
  )
}
