import { useTranslation } from '@pancakeswap/localization'
import { Flex, QuestionHelper, Text, Toggle } from '@pancakeswap/uikit'
import { memo } from 'react'
import { useAutoSlippageEnabled } from 'hooks/useAutoSlippageWithFallback'

// Using the shared atom from useAutoSlippageWithFallback.tsx
// This ensures consistency across the application

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
