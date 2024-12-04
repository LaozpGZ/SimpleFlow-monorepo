import dynamic from 'next/dynamic'
import { memo, useCallback, useMemo, useRef } from 'react'

import { AutoColumn, Button, useMatchBreakpoints } from '@pancakeswap/uikit'

import { useTranslation } from '@pancakeswap/localization'
import replaceBrowserHistoryMultiple from '@pancakeswap/utils/replaceBrowserHistoryMultiple'

import { AutoRow } from 'components/Layout/Row'
import { Field } from 'state/swap/actions'
import { useSwapState } from 'state/swap/hooks'
import { useSwapActionHandlers } from 'state/swap/useSwapActionHandlers'
import { styled } from 'styled-components'

import { useTheme } from '@pancakeswap/hooks'
import { SwapUIV2 } from '@pancakeswap/widgets-internal'
import { LottieRefCurrentProps } from 'lottie-react'
import { useAllowRecipient } from '../../Swap/V3Swap/hooks'

import ArrowDark from '../../../../public/images/swap/arrow_dark.json' assert { type: 'json' }
import ArrowLight from '../../../../public/images/swap/arrow_light.json' assert { type: 'json' }

const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

export const Line = styled.div`
  position: absolute;
  left: -16px;
  right: -16px;
  height: 1px;
  background-color: ${({ theme }) => theme.colors.cardBorder};
  top: calc(50% + 6px);
`

export const FlipButton = memo(function FlipButton() {
  const lottieRef = useRef<LottieRefCurrentProps | null>(null)
  const { isDark } = useTheme()
  const { isDesktop } = useMatchBreakpoints()

  const animationData = useMemo(() => (isDark ? ArrowDark : ArrowLight), [isDark])

  const { onSwitchTokens } = useSwapActionHandlers()
  const {
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()

  const onFlip = useCallback(() => {
    onSwitchTokens()
    replaceBrowserHistoryMultiple({
      inputCurrency: outputCurrencyId,
      outputCurrency: inputCurrencyId,
    })
  }, [onSwitchTokens, inputCurrencyId, outputCurrencyId])

  return (
    <AutoColumn justify="space-between" position="relative">
      <Line />
      <AutoRow justify="center" style={{ padding: '0 1rem', marginTop: '1em' }}>
        {isDesktop ? (
          <Lottie
            lottieRef={lottieRef}
            animationData={animationData}
            style={{ height: '40px', cursor: 'pointer' }}
            onClick={onFlip}
            autoplay={false}
            loop={false}
            onMouseEnter={() => lottieRef.current?.playSegments([7, 19], true)}
            onMouseLeave={() => lottieRef.current?.playSegments([39, 54], true)}
          />
        ) : (
          <SwapUIV2.SwitchButtonV2 onClick={onFlip} />
        )}
      </AutoRow>
    </AutoColumn>
  )
})

export const AssignRecipientButton: React.FC = memo(() => {
  const { t } = useTranslation()
  const { recipient } = useSwapState()
  const { onChangeRecipient } = useSwapActionHandlers()
  const allowRecipient = useAllowRecipient()
  if (!allowRecipient || recipient !== null) return null
  return (
    <Button
      variant="text"
      id="add-recipient-button"
      onClick={() => onChangeRecipient('')}
      data-dd-action-name="Swap flip button"
      width="100%"
    >
      {t('+ Assign Recipient')}
    </Button>
  )
})
