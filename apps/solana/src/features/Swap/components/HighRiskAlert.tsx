import { VStack } from '@chakra-ui/react'
import { useTranslation } from '@pancakeswap/localization'
import { ModalV2, MotionModal, useMatchBreakpoints, Text, Button, Flex, Box } from '@pancakeswap/uikit'
import { colors } from '@/theme/cssVariables'

export default function HighRiskAlert({
  isOpen,
  percent,
  onClose,
  onConfirm
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  percent: number
}) {
  const { t } = useTranslation()
  const { isMobile } = useMatchBreakpoints()

  return (
    <ModalV2 isOpen={isOpen} onDismiss={onClose} closeOnOverlayClick>
      <MotionModal
        title={t('High Price Impact Warning')}
        onDismiss={onClose}
        minWidth={[null, null, '370px']}
        maxWidth={['100%', '100%', '100%', '370px']}
        minHeight={isMobile ? '400px' : undefined}
        headerPadding="2px 14px 0 24px"
      >
        <VStack spacing={6}>
          <Text fontSize="md" fontWeight="400" color={colors.textPrimary}>
            {t('Price impact for this swap is %percent%', { percent: `${percent.toFixed(2)}%` })}
            <br />
            {t('Confirming may result in a poor price for this swap!')}
          </Text>

          <VStack width="full" spacing={2}>
            <Button width="100%" onClick={onClose}>
              {t('Cancel')}
            </Button>
            <Button width="100%" variant="secondary" onClick={onConfirm}>
              {t('Swap Anyway')}
            </Button>
          </VStack>
        </VStack>
      </MotionModal>
    </ModalV2>
  )
}
