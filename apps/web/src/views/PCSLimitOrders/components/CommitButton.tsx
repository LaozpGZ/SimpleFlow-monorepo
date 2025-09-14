import { useTranslation } from '@pancakeswap/localization'
import {
  Alert,
  ArrowForwardIcon,
  AutoColumn,
  Box,
  Button,
  ErrorIcon,
  FlexGap,
  IconButton,
  InfoIcon,
  Message,
  MessageText,
  Modal,
  ModalV2,
  MotionModal,
  RowBetween,
  SwapHorizIcon,
  Text,
  useModalV2,
  WarningIcon,
} from '@pancakeswap/uikit'
import { DualCurrencyDisplay, LightGreyCard } from '@pancakeswap/widgets-internal'
import { useAtomValue } from 'jotai'
import { Suspense, useMemo, useState } from 'react'
import { getFullChainNameById } from 'utils/getFullChainNameById'
import { BigNumber as BN } from 'bignumber.js'
import { formattedAmountsAtom } from '../state/form/inputAtoms'
import { Field } from '../types/limitOrder.types'
import { inputCurrencyAtom, outputCurrencyAtom } from '../state/currency/currencyAtoms'

export const CommitButton = () => {
  const { t } = useTranslation()
  const { isOpen, onDismiss, onOpen } = useModalV2()

  /** Look at existing commit buttons for states.
   * Such as: Connect Wallet, Switch Network, Approve Tokens (need an extra button on top), etc.
   * Actually, should approve button be in the main button or in the PREVIEW Modal? 🤔
   */
  return (
    <>
      <Suspense>
        <Button onClick={onOpen}>{t('Place Limit Order')}</Button>
      </Suspense>
      <PreviewModal isOpen={isOpen} onDismiss={onDismiss} />
    </>
  )
}

interface PreviewModalProps {
  isOpen: boolean
  onDismiss: () => void
}
const PreviewModal = ({ isOpen, onDismiss }: PreviewModalProps) => {
  const { t } = useTranslation()

  return (
    <ModalV2 isOpen={isOpen} onDismiss={onDismiss} closeOnOverlayClick>
      <MotionModal
        title={t('Place Limit Order')}
        headerBorderColor="transparent"
        bodyPadding="0 24px 24px"
        maxWidth={[null, null, null, '440px']}
      >
        <ConfirmOrderContent />
      </MotionModal>
    </ModalV2>
  )
}

const ConfirmOrderContent = () => {
  const { t } = useTranslation()
  const inputCurrency = useAtomValue(inputCurrencyAtom)
  const outputCurrency = useAtomValue(outputCurrencyAtom)
  const formattedAmounts = useAtomValue(formattedAmountsAtom)

  const [isInverted, setIsInverted] = useState(false)
  const quotePrice = useMemo(() => {
    const amountA = BN(formattedAmounts[Field.CURRENCY_A])
    const amountB = BN(formattedAmounts[Field.CURRENCY_B])
    return isInverted ? amountA.dividedBy(amountB).toPrecision(6) : amountB.dividedBy(amountA).toPrecision(6)
  }, [isInverted, formattedAmounts])

  return (
    <Box mt="8px">
      <Box px="32px">
        <DualCurrencyDisplay
          inputCurrency={inputCurrency ?? undefined}
          outputCurrency={outputCurrency ?? undefined}
          inputAmount={formattedAmounts[Field.CURRENCY_A]}
          outputAmount={formattedAmounts[Field.CURRENCY_B]}
          inputChainName={getFullChainNameById(inputCurrency?.chainId)}
          outputChainName={getFullChainNameById(outputCurrency?.chainId)}
          overrideIcon={<ArrowForwardIcon width="24px" ml="4px" color="textSubtle" />}
        />
      </Box>

      <LightGreyCard mt="24px" padding="16px">
        <AutoColumn gap="12px">
          <RowBetween>
            <Text color="textSubtle" small>
              {t('Limit Price')}
            </Text>
            <FlexGap alignItems="center" gap="4px">
              <Text small> 1 {isInverted ? outputCurrency?.symbol : inputCurrency?.symbol} </Text>
              <IconButton onClick={() => setIsInverted(!isInverted)} variant="text" scale="xs">
                <SwapHorizIcon width="18px" height="18px" color="primary60" />
              </IconButton>
              <Text small>
                {' '}
                {quotePrice} {isInverted ? inputCurrency?.symbol : outputCurrency?.symbol}{' '}
              </Text>
            </FlexGap>
          </RowBetween>

          <RowBetween>
            <Text color="textSubtle" small>
              {t('Fees Earned')}
            </Text>
            <Text small>$9.99</Text>
          </RowBetween>

          <RowBetween>
            <Text color="textSubtle" small>
              {t('Amount Received')}
            </Text>
            <Text small>9.99 {outputCurrency?.symbol}</Text>
          </RowBetween>
        </AutoColumn>
      </LightGreyCard>

      <Message
        mt="16px"
        padding="12px"
        variant="warning"
        icon={<ErrorIcon width="24px" height="24px" color="v2Warning50" />}
      >
        <Text small>
          {t(
            'Liquidity will be added at the tick closest to your specified limit price. The limit order may not execute exactly when the token price reaches your specified value on external markets.',
          )}
        </Text>
      </Message>

      <Button mt="16px" width="100%">
        {t('Confirm')}
      </Button>
    </Box>
  )
}
