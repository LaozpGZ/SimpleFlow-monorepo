import { useTranslation } from '@pancakeswap/localization'
import {
  Box,
  Button,
  FlexGap,
  getPortalRoot,
  HelpIcon,
  IconButton,
  LinkExternal,
  Modal,
  ModalProps,
  ModalV2,
} from '@pancakeswap/uikit'
import { ReactElement, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { styled } from 'styled-components'

const FixedContainer = styled.div`
  position: fixed;
  right: 18px;
  bottom: calc(54px + env(safe-area-inset-bottom));
`

const FaqModal: React.FC<React.PropsWithChildren<ModalProps>> = ({ children, ...props }) => {
  return (
    <Modal
      hideCloseButton
      minHeight="415px"
      width={['100%', '100%', '100%', '400px']}
      headerPadding="12px 24px"
      bodyPadding="0 24px 24px"
      headerBackground="transparent"
      headerBorderColor="transparent"
      headerProps={{
        width: '100%',
        textAlign: 'center',
        py: '4px',
      }}
      {...props}
    >
      {children}
    </Modal>
  )
}

interface PinnedFAQButtonProps {
  modalContent: ReactElement
  docLink: string
}

const PinnedFAQButton: React.FC<PinnedFAQButtonProps> = ({ modalContent, docLink }) => {
  const [visible, setVisible] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const anchorRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()

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
    <Button
      px="0px"
      style={{ borderRadius: visible ? '' : '12px' }}
      width={visible ? '48px' : '36px'}
      height={visible ? '48px' : '36px'}
      variant="subtle"
      onClick={handleOpenModal}
    >
      <HelpIcon ml="0" color="white" width="24px" />
    </Button>
  )

  const portal = useMemo(() => getPortalRoot(), [])

  return (
    <>
      <Box ref={anchorRef} id="anchor-fqa-button">
        {button}
      </Box>
      {portal &&
        createPortal(
          <FixedContainer style={{ display: visible ? 'inline' : 'none' }}>{button}</FixedContainer>,
          portal,
        )}

      <ModalV2 isOpen={showModal} onDismiss={handleCloseModal}>
        <FaqModal onDismiss={handleCloseModal} title={t('Quick start')}>
          {modalContent}
          <FlexGap flexDirection="row" gap="16px" mt="16px">
            <IconButton variant="text" onClick={handleCloseModal}>
              {t('Hide')}
            </IconButton>
            <Button width="100%" variant="subtle" as="a" target="_blank" href={docLink}>
              <LinkExternal color="backgroundAlt" href={docLink}>
                {t('View details in Docs')}
              </LinkExternal>
            </Button>
          </FlexGap>
        </FaqModal>
      </ModalV2>
    </>
  )
}

export default PinnedFAQButton
