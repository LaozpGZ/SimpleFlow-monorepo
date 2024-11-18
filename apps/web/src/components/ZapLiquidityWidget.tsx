import '@kyberswap/pancake-liquidity-widgets/dist/style.css'
import { useTranslation } from '@pancakeswap/localization'
import { Currency } from '@pancakeswap/sdk'
import {
  Flex,
  InfoFilledIcon,
  Message,
  MessageText,
  ModalContainer,
  ModalV2,
  useModal,
  useToast,
} from '@pancakeswap/uikit'
import { Pool } from '@pancakeswap/v3-sdk'
import { ToastDescriptionWithTx } from 'components/Toast'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import noop from 'lodash/noop'
import dynamic from 'next/dynamic'
import { useCallback, useMemo, useState } from 'react'
import { useTransactionAdder } from 'state/transactions/hooks'
import { useTheme } from 'styled-components'
import { getAddress } from 'viem'
import { useWalletClient } from 'wagmi'
import CurrencySearchModal from 'components/SearchModal/CurrencySearchModal'
import { CommonBasesType } from 'components/SearchModal/types'
import { isAddressEqual } from 'utils'

export enum InitDepositToken {
  BASE_CURRENCY,
  QUOTE_CURRENCY,
}

interface ZapLiquidityProps {
  tickLower?: number
  tickUpper?: number
  pool?: Pool | null
  baseCurrency?: Currency | null
  quoteCurrency?: Currency | null
  initDepositToken?: InitDepositToken
  initAmount?: string
  onSubmit?: () => void
}

const LiquidityWidget = dynamic(
  () => import('@kyberswap/pancake-liquidity-widgets').then((mod) => mod.LiquidityWidget),
  { ssr: false },
)

const NATIVE_CURRENCY_ADDRESS = getAddress('0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE')

export const ZapLiquidityWidget: React.FC<ZapLiquidityProps> = ({
  tickLower,
  tickUpper,
  pool,
  baseCurrency,
  quoteCurrency,
  initDepositToken,
  initAmount,
  onSubmit,
}) => {
  const { t } = useTranslation()

  const { isDark } = useTheme()

  const { account, chainId } = useActiveWeb3React()

  const { data: walletClient } = useWalletClient()

  const addTransaction = useTransactionAdder()

  const { toastSuccess } = useToast()

  const [isModalOpen, setIsModalOpen] = useState(false)

  const poolAddress = useMemo(() => pool && Pool.getAddress(pool.token0, pool.token1, pool.fee), [pool])

  const [initDepositTokens, setInitDepositTokens] = useState<string>('')

  const [initAmounts, setInitAmounts] = useState<string>('')

  const handleOnClick = useCallback(() => {
    setInitDepositTokens(
      initDepositToken === InitDepositToken.BASE_CURRENCY
        ? baseCurrency?.isNative
          ? NATIVE_CURRENCY_ADDRESS
          : baseCurrency?.wrapped?.address || ''
        : quoteCurrency?.isNative
        ? NATIVE_CURRENCY_ADDRESS
        : quoteCurrency?.wrapped?.address || '',
    )
    setInitAmounts(initAmount || '')
    setIsModalOpen(true)
  }, [])

  const handleOnDismiss = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  const handleTransaction = useCallback(
    (txHash: string) => {
      toastSuccess(`${t('Transaction Submitted')}!`, <ToastDescriptionWithTx txHash={txHash} />)
      addTransaction(
        { hash: txHash },
        {
          type: 'zap-liquidity-v3',
          summary: `Zap in for ${baseCurrency?.symbol} - ${quoteCurrency?.symbol}`,
          translatableSummary: {
            text: 'Zap in for %lpSymbol%',
            data: { lpSymbol: `${baseCurrency?.symbol} - ${quoteCurrency?.symbol}` },
          },
        },
      )
      setIsModalOpen(false)
      onSubmit?.()
    },
    [addTransaction, baseCurrency?.symbol, quoteCurrency?.symbol, t, toastSuccess, onSubmit],
  )

  const handleSelectToken = useCallback(
    (token: Currency) => {
      const selectedToken =
        token.wrapped && !token.isNative
          ? { ...token, ...token.wrapped }
          : { ...token, address: NATIVE_CURRENCY_ADDRESS }
      const indexOfToken = initDepositTokens
        .split(',')
        .findIndex((depositToken) => isAddressEqual(depositToken === selectedToken.address))

      if (indexOfToken > -1) return
      setInitDepositTokens(
        initDepositTokens ? `${initDepositTokens},${selectedToken.address}` : `${selectedToken.address}`,
      )
      setInitAmounts(initAmounts ? `${initAmounts},` : '')
    },
    [initDepositTokens, initAmounts],
  )

  const handleAmountChange = useCallback(
    (tokenAddress: string, amount: string) => {
      const indexOfToken = initDepositTokens
        .split(',')
        .findIndex((depositToken) => isAddressEqual(depositToken, tokenAddress))
      if (indexOfToken === -1) return

      const amounts = initAmounts.split(',')
      amounts[indexOfToken] = amount
      setInitAmounts(amounts.join(','))
    },
    [initAmounts, initDepositTokens],
  )

  const handleAddTokens = useCallback(
    (tokenAddresses: string) => {
      setInitDepositTokens(initDepositTokens ? `${initDepositTokens},${tokenAddresses}` : tokenAddresses)
      const amountsToAdd = tokenAddresses
        .split('')
        .filter((item) => item === ',')
        .join('')
      setInitAmounts(initAmounts ? `${initAmounts},${amountsToAdd}` : amountsToAdd)
    },
    [initAmounts, initDepositTokens],
  )

  const handleRemoveToken = useCallback(
    (tokenAddress: string) => {
      const tokens = initDepositTokens.split(',')
      const indexOfToken = tokens.findIndex((depositToken) => isAddressEqual(depositToken, tokenAddress))
      if (indexOfToken === -1) return

      tokens.splice(indexOfToken, 1)
      const amounts = initAmounts.split(',')
      amounts.splice(indexOfToken, 1)
      setInitDepositTokens(tokens.join(','))
      setInitAmounts(amounts.join(','))
    },
    [initAmounts, initDepositTokens],
  )

  const [onPresentCurrencyModal] = useModal(
    <CurrencySearchModal
      onCurrencySelect={handleSelectToken}
      otherSelectedCurrency={initDepositToken === InitDepositToken.BASE_CURRENCY ? quoteCurrency : baseCurrency}
      commonBasesType={CommonBasesType.LIQUIDITY}
      mode="zap-currency"
      showCommonBases
      showCurrencyInHeader
      showSearchInput
    />,
  )

  return (
    <>
      <Message variant="primary" padding="8px" icon={<InfoFilledIcon color="secondary" />}>
        <Flex flexDirection="column" style={{ gap: 8 }}>
          <MessageText lineHeight="120%" fontSize={16}>
            {t('Try Zap to automatically balance and provide V3 liquidity in one click.')}
          </MessageText>
          <span
            onClick={handleOnClick}
            role="presentation"
            style={{ whiteSpace: 'nowrap', textDecoration: 'underline', cursor: 'pointer' }}
            data-dd-action-name="Zap V3 Liquidity"
          >
            <MessageText fontWeight={600} fontSize={16}>
              {t('Click here to start')} {'>>'}
            </MessageText>
          </span>
        </Flex>
      </Message>

      <ModalV2 closeOnOverlayClick isOpen={isModalOpen} onDismiss={handleOnDismiss}>
        <ModalContainer style={{ maxHeight: '90vh', overflow: 'auto' }}>
          <LiquidityWidget
            feeAddress="0xB82bb6Ce9A249076Ca7135470e7CA634806De168"
            feePcm={0}
            onConnectWallet={noop}
            walletClient={walletClient}
            account={account ?? undefined}
            networkChainId={chainId}
            chainId={chainId}
            initTickLower={tickLower ? +tickLower : undefined}
            initTickUpper={tickUpper ? +tickUpper : undefined}
            initAmounts={initAmounts}
            initDepositTokens={initDepositTokens}
            onAddTokens={handleAddTokens}
            onRemoveToken={handleRemoveToken}
            onAmountChange={handleAmountChange}
            onOpenTokenSelectModal={onPresentCurrencyModal}
            poolAddress={poolAddress ?? '0x'}
            theme={isDark ? 'dark' : 'light'}
            onDismiss={handleOnDismiss}
            onTxSubmit={handleTransaction}
            source="pancakeswap"
          />
        </ModalContainer>
      </ModalV2>
    </>
  )
}
