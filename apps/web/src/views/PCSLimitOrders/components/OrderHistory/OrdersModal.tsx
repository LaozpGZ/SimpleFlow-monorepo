import { ModalV2, MotionModal, useMatchBreakpoints } from '@simpleflow/uikit'
import { useTranslation } from '@simpleflow/l10n'
import { OrdersTable } from './OrdersTable'
import { OpenOrdersToggle } from './OpenOrdersToggle'

interface OrdersModalProps {
  isOpen: boolean
  onDismiss: () => void
}
export const OrdersModal = ({ isOpen, onDismiss }: OrdersModalProps) => {
  const { t } = useTranslation()
  const { isMobile, isTablet } = useMatchBreakpoints()
  const isSmallScreen = isMobile || isTablet

  return (
    <ModalV2 isOpen={isOpen} onDismiss={onDismiss} closeOnOverlayClick>
      <MotionModal
        title={t('Limit Orders')}
        headerRightSlot={isSmallScreen && <OpenOrdersToggle />}
        bodyPadding="0"
        headerPadding={isSmallScreen ? '16px' : '8px 16px 4px !important'}
        headerBorderColor="transparent"
        minHeight="unset"
        minWidth={[null, null, null, '800px']}
        hideCloseButton={isSmallScreen}
      >
        <OrdersTable />
      </MotionModal>
    </ModalV2>
  )
}
