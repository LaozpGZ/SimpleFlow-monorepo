import { ChainId } from '@pancakeswap/chains'
import { useTranslation } from '@pancakeswap/localization'
import { Percent } from '@pancakeswap/sdk'
import { CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  domAnimation,
  FlexGap,
  LazyAnimatePresence,
  ModalBody,
  ModalContainer,
  ModalV2,
  Text,
  useModalV2,
} from '@pancakeswap/uikit'
import { formatAmount } from '@pancakeswap/utils/formatFractions'
import getTimePeriods from '@pancakeswap/utils/getTimePeriods'
import { CurrencyLogo, SwapUIV2 } from '@pancakeswap/widgets-internal'
import BigNumber from 'bignumber.js'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { useCallback, useMemo, useState } from 'react'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { styled } from 'styled-components'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { useAccount } from 'wagmi'
import { IdoRibbon } from './IdoRibbon'

import { getBannerUrl } from '../../helpers'
import { useIDODepositCallback } from '../../hooks/ido/useIDODepositCallback'
import { IDOPublicData } from '../../hooks/ido/useIdoPublicData'

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
  background-image: ${({ ifoId }) => `url('${getBannerUrl(ifoId)}')`};
  ${({ theme }) => theme.mediaQueries.md} {
    height: 112px;
  }
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
        />
        <IdoCard idoPublicData={idoPublicData} />
      </Box>
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
  return (
    <Card background="#FAF9FA" mb="16px">
      <CardBody>
        <FlexGap gap="8px">
          {/* @ts-ignore */}
          <CurrencyLogo size="40px" currency={idoPublicData?.offeringCurrency} />
          <FlexGap flexDirection="column">
            <Text fontSize="12px" bold color="secondary" lineHeight="18px">
              {t('Total Sale')}
            </Text>
            <Text bold fontSize="20px" lineHeight="30px">
              {idoPublicData.saleAmount?.toSignificant(6)}
              {idoPublicData.offeringCurrency?.symbol}
            </Text>
          </FlexGap>
        </FlexGap>
        <FlexGap flexDirection="column" gap="8px">
          <FlexGap justifyContent="space-between">
            <Text color="textSubtle">{t('Project Duration')}</Text>
            <Text>
              {getTimePeriods(idoPublicData.duration).days} {t('days')}
            </Text>
          </FlexGap>
        </FlexGap>
        <Text color="textSubtle" mt="16px">
          {t('You can subscribe to the sale by depositing BNB and CAKE half in ratio.')}
        </Text>
      </CardBody>
    </Card>
  )
}

export const IdoStakeActionCard: React.FC<{ idoPublicData: IDOPublicData }> = ({ idoPublicData }) => {
  const { t } = useTranslation()
  const { address: account } = useAccount()
  return (
    <Card background="#FAF9FA">
      <CardBody>
        <FlexGap flexDirection="column" gap="8px">
          <FlexGap flexDirection="column" gap="8px">
            <Text fontSize="12px" bold color="secondary" lineHeight="18px">
              {idoPublicData.stakeCurrency?.symbol} {t('Pool')}
            </Text>
            <FlexGap gap="8px">
              {/* @ts-ignore */}
              <CurrencyLogo size="40px" currency={idoPublicData?.stakeCurrency} />
              {account ? <IdoDepositButton idoPublicData={idoPublicData} /> : <ConnectWalletButton width="100%" />}
            </FlexGap>
          </FlexGap>
          <FlexGap justifyContent="space-between">
            <Text color="textSubtle">{t('Sale Price per TOKEN')}</Text>
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
          {idoPublicData.status === 'live' && (
            <>
              <FlexGap justifyContent="space-between">
                <Text color="textSubtle">{t('Total committed')}</Text>
                <Text>
                  {idoPublicData?.currentStakedAmount?.toSignificant(6)} {idoPublicData.stakeCurrency?.symbol ?? ''}
                </Text>
              </FlexGap>
              <FlexGap justifyContent="space-between">
                <Text color="textSubtle">{t('Status')}</Text>
                <Text>{idoPublicData.progress.toFixed(2)} %</Text>
              </FlexGap>
            </>
          )}
        </FlexGap>
      </CardBody>
    </Card>
  )
}

export const IdoDepositButton: React.FC<{ idoPublicData: IDOPublicData }> = ({ idoPublicData }) => {
  const { t } = useTranslation()
  const { onDismiss, onOpen, isOpen } = useModalV2()
  const [value, setValue] = useState('')

  const { address: account } = useAccount()
  const inputBalance = useCurrencyBalance(account ?? undefined, idoPublicData?.stakeCurrency ?? undefined)
  const balance = idoPublicData?.stakeCurrency ? formatAmount(inputBalance, 6) : undefined
  const { deposit } = useIDODepositCallback()

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
    [maxAmountInput, setValue],
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

  return (
    <>
      <Button width="100%" onClick={onOpen}>
        {t('Deposit')} {idoPublicData?.stakeCurrency?.symbol ?? ''}
      </Button>
      <ModalV2 isOpen={isOpen} title="Deposit" onDismiss={onDismiss} closeOnOverlayClick>
        <ModalContainer>
          <ModalBody p="16px" pt="30px">
            <FlexGap flexDirection="column" gap="8px">
              <SwapUIV2.CurrencyInputPanelSimplify
                id={`idoStakeCurrency${idoPublicData?.stakeCurrency?.symbol ?? ''}`}
                disabled={false}
                error={false}
                value={value}
                placeholder="0.00"
                onUserInput={setValue}
                top={
                  <FlexGap justifyContent="space-between" alignItems="center" width="100%" position="relative">
                    <Text bold>{t('Deposit')}</Text>
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
              />
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
                    {getTimePeriods(idoPublicData.duration).days} {t('days')}
                  </Text>
                </FlexGap>
                <Text color="textSubtle" fontSize="12px">
                  {t(
                    'Some Rules/ T&C context or information that user need to know before locking BNB/ participating in IDO, show here.',
                  )}
                </Text>
                <Button
                  disabled={value === '' || !depositAmount || isUserInsufficientBalance}
                  width="100%"
                  onClick={() => {
                    if (depositAmount) deposit(depositAmount)
                  }}
                >
                  {t('Confirm Deposit')}
                </Button>
              </FlexGap>
            </FlexGap>
          </ModalBody>
        </ModalContainer>
      </ModalV2>
    </>
  )
}
