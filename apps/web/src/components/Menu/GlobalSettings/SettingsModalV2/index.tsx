import { useTranslation } from '@pancakeswap/localization'
import { AtomBox, Button, ButtonProps, ModalV2, NotificationDot, useModalV2 } from '@pancakeswap/uikit'

import { ReactNode, useCallback } from 'react'
import { useRoutingSettingChanged } from 'state/user/smartRouter'
import { CustomizeRoutingTab } from './CustomizeRoutingTab'

export function RoutingSettingsButton({
  children,
  showRedDot = true,
  buttonProps,
}: {
  children?: ReactNode
  showRedDot?: boolean
  buttonProps?: ButtonProps
}) {
  const { t } = useTranslation()
  const { isOpen, setIsOpen, onDismiss } = useModalV2()
  const [isRoutingSettingChange] = useRoutingSettingChanged()

  return (
    <>
      <AtomBox textAlign="center">
        <NotificationDot show={isRoutingSettingChange && showRedDot}>
          <Button variant="text" onClick={() => setIsOpen(true)} scale="sm" {...buttonProps}>
            {children || t('Customize Routing')}
          </Button>
        </NotificationDot>
      </AtomBox>
      <ModalV2 isOpen={isOpen} onDismiss={onDismiss} closeOnOverlayClick>
        <CustomizeRoutingTab key="customize_routing_tab" />
      </ModalV2>
    </>
  )
}

export const withCustomOnDismiss =
  (Component) =>
  ({ onDismiss, customOnDismiss, ...props }: { onDismiss?: () => void; customOnDismiss: () => void }) => {
    const handleDismiss = useCallback(() => {
      onDismiss?.()
      if (customOnDismiss) {
        customOnDismiss()
      }
    }, [customOnDismiss, onDismiss])

    return <Component {...props} onDismiss={handleDismiss} />
  }
