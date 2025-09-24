import { ModalV2, MotionModal } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { OrdersTable } from './OrdersTable'

interface OrdersModalProps {
  isOpen: boolean
  onDismiss: () => void
}
export const OrdersModal = ({ isOpen, onDismiss }: OrdersModalProps) => {
  const { t } = useTranslation()

  return (
    <ModalV2 isOpen={isOpen} onDismiss={onDismiss} closeOnOverlayClick>
      <MotionModal
        title={t('Limit Orders')}
        bodyPadding="0"
        headerPadding="8px 16px 4px !important"
        headerBorderColor="transparent"
        minHeight="unset"
        minWidth={[null, null, null, '800px']}
      >
        <OrdersTable />
      </MotionModal>
    </ModalV2>
  )
}
