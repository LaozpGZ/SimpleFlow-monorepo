import { useTranslation } from '@pancakeswap/localization'
import { Flex, QuestionHelper, Text, Toggle } from '@pancakeswap/uikit'
import { atomWithStorage } from 'jotai/utils'
import { useAtom } from 'jotai'
import { memo } from 'react'

// Atom to store the user's preference for auto slippage
const useAutoSlippageAtom = atomWithStorage('pcs:auto-slippage', false)

export const useAutoSlippageEnabled = () => {
  return useAtom(useAutoSlippageAtom)
}

interface AutoSlippageToggleProps {
  id?: string
}

export const AutoSlippageToggle = memo(function AutoSlippageToggle({
  id = 'auto-slippage-toggle',
}: AutoSlippageToggleProps) {
  const { t } = useTranslation()
  const [isAutoSlippageEnabled, setIsAutoSlippageEnabled] = useAutoSlippageEnabled()

  return (
    <Flex justifyContent="space-between" alignItems="center" mb="12px">
      <Flex alignItems="center">
        <Text>{t('Auto Slippage')}</Text>
        <QuestionHelper
          text={t(
            'When enabled, slippage will be automatically calculated based on the trade size and gas costs to provide optimal protection against MEV.',
          )}
          placement="top"
          ml="4px"
        />
      </Flex>
      <Toggle
        id={id}
        checked={isAutoSlippageEnabled}
        scale="md"
        onChange={() => {
          setIsAutoSlippageEnabled(!isAutoSlippageEnabled)
        }}
      />
    </Flex>
  )
})
