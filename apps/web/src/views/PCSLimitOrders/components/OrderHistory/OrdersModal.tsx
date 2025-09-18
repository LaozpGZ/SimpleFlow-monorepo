import { Modal, ModalV2 } from '@pancakeswap/uikit'
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
      <Modal
        title={t('Limit Orders')}
        bodyPadding="0 0 16px"
        headerPadding="8px 16px 4px !important"
        headerBorderColor="transparent"
        minWidth={[null, null, null, '800px']}
      >
        <OrdersTable />
      </Modal>
    </ModalV2>
  )
}
