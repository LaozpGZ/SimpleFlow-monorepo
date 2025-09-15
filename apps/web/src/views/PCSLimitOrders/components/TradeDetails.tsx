import { useTranslation } from '@pancakeswap/localization'
import { AutoColumn, Box, BoxProps, DottedHelpText, QuestionHelperV2, RowBetween, Text } from '@pancakeswap/uikit'
import { useAtomValue } from 'jotai'
import { outputCurrencyAtom } from '../state/currency/currencyAtoms'
import { amountReceivedAtom, feesEarnedUSDAtom } from '../state/form/tradeDetailsAtoms'

export const TradeDetails = (props: BoxProps) => {
  const { t } = useTranslation()
  const outputCurrency = useAtomValue(outputCurrencyAtom)

  const feesEarnedUSD = useAtomValue(feesEarnedUSDAtom)
  const amountReceived = useAtomValue(amountReceivedAtom)

  return (
    <Box {...props}>
      <AutoColumn gap="8px">
        <RowBetween>
          <QuestionHelperV2 text={t('Minimum fee earned by the user on order fill')}>
            <DottedHelpText>{t('Fees Earned')}</DottedHelpText>
          </QuestionHelperV2>

          <Text small>{feesEarnedUSD ? `$${feesEarnedUSD.toFormat(2)}` : '-'}</Text>
        </RowBetween>
        <RowBetween>
          <QuestionHelperV2 text={t('Amount you will receive on order fill')}>
            <DottedHelpText>{t('Amount Received')}</DottedHelpText>
          </QuestionHelperV2>

          <Text small>{amountReceived ? `${amountReceived.toFormat(2)} ${outputCurrency?.symbol}` : '-'}</Text>
        </RowBetween>
      </AutoColumn>
    </Box>
  )
}
