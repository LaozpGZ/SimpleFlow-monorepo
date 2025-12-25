import { useTranslation } from '@simpleflow/l10n'
import { PreTitle } from '@simpleflow/uikit'
import { useSolanaUserSlippage, useUserSlippage } from '@simpleflow/utils/user'
import { SlippageTabsComponent } from 'components/Menu/GlobalSettings/TransactionSettings'
import { useAutoSlippageEnabled } from 'hooks/useAutoSlippageWithFallback'

export const SolanaSlippageSetting = () => {
  const [userSlippageTolerance, setUserSlippageTolerance] = useSolanaUserSlippage()

  return (
    <SlippageTabsComponent slippageTolerance={userSlippageTolerance} setSlippageTolerance={setUserSlippageTolerance} />
  )
}

export const EVMSlippageSetting = () => {
  const [isAutoSlippageEnabled, setIsAutoSlippageEnabled] = useAutoSlippageEnabled()
  const [userSlippageTolerance, setUserSlippageTolerance] = useUserSlippage()

  return (
    <SlippageTabsComponent
      slippageTolerance={userSlippageTolerance}
      setSlippageTolerance={setUserSlippageTolerance}
      isAutoSlippageEnabled={isAutoSlippageEnabled}
      setIsAutoSlippageEnabled={setIsAutoSlippageEnabled}
    />
  )
}

export const EVMLiquiditySlippageSetting = () => {
  const [userSlippageTolerance, setUserSlippageTolerance] = useUserSlippage()
  const { t } = useTranslation()

  return (
    <>
      <PreTitle mb="8px">{t('Liquidity Slippage')}</PreTitle>
      <SlippageTabsComponent
        slippageTolerance={userSlippageTolerance}
        setSlippageTolerance={setUserSlippageTolerance}
      />
    </>
  )
}
