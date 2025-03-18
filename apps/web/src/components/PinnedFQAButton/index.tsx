import { Button, getPortalRoot, HelpIcon, Modal, ModalProps, ModalV2 } from '@pancakeswap/uikit'
import { ReactElement, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { styled } from 'styled-components'

const FixedContainer = styled.div`
  position: fixed;
  right: 18px;
  bottom: calc(54px + env(safe-area-inset-bottom));
`

const FaqModal: React.FC<React.PropsWithChildren<Omit<ModalProps, 'title'>>> = ({ children, ...props }) => {
  return (
    <Modal
      title="FAQ"
      minHeight="415px"
      width={['100%', '100%', '100%', '400px']}
      headerPadding="12px 24px"
      bodyPadding="0 24px 24px"
      headerBackground="transparent"
      headerBorderColor="transparent"
      {...props}
    >
      {children}
    </Modal>
  )
}

interface PinnedFQAButtonProps {
  modalContent: ReactElement
}

const PinnedFQAButton: React.FC<PinnedFQAButtonProps> = ({ modalContent }) => {
  const [visible, setVisible] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const anchorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!anchorRef.current) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show fixed button when anchor is not visible (off screen)
        setVisible(!entry.isIntersecting)
      },
      { threshold: 0 },
    )

    observer.observe(anchorRef.current)

    return () => {
      observer.disconnect()
    }
  }, [])

  const handleOpenModal = (e) => {
    e.preventDefault()
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
  }

  const button = (
    <Button width="48px" height="48px" variant="subtle" onClick={handleOpenModal}>
      <HelpIcon ml="0" color="white" width="24px" />
    </Button>
  )

  const portal = useMemo(() => getPortalRoot(), [])

  return (
    <>
      <div ref={anchorRef} id="anchor-fqa-button">
        {button}
      </div>
      {portal &&
        createPortal(
          <FixedContainer style={{ display: visible ? 'inline' : 'none' }}>{button}</FixedContainer>,
          portal,
        )}

      <ModalV2 isOpen={showModal} onDismiss={handleCloseModal}>
        <FaqModal onDismiss={handleCloseModal}>{modalContent}</FaqModal>
      </ModalV2>
    </>
  )
}

export default PinnedFQAButton
