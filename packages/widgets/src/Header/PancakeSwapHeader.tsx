'use client'

import { SimpleMenu } from '@pancakeswap/uikit'
import { ReactNode } from 'react'

export type PancakeSwapHeaderProps = React.PropsWithChildren<{
  announcementBanner?: ReactNode
  navigation?: ReactNode
  bottomNavigation?: ReactNode
  rightSlot?: ReactNode
  asContainer?: boolean
  [key: string]: any
}>

export const PancakeSwapHeader: React.FC<PancakeSwapHeaderProps> = ({
  children,
  announcementBanner,
  navigation,
  bottomNavigation,
  rightSlot,
  asContainer = true,
  ...props
}) => {
  return (
    <SimpleMenu
      announcementBanner={announcementBanner}
      navigation={navigation}
      bottomNavigation={bottomNavigation}
      rightSlot={rightSlot}
      asContainer={asContainer}
      {...props}
    >
      {children}
    </SimpleMenu>
  )
}
