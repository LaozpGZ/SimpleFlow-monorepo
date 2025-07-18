import { SimpleMenu } from '@pancakeswap/uikit'
import { ReactNode } from 'react'

export type PancakeSwapHeaderProps = React.PropsWithChildren<{
  announcementBanner?: ReactNode
  navigation?: ReactNode
  bottomNavigation?: ReactNode
  [key: string]: any
}>

export const PancakeSwapHeader: React.FC<PancakeSwapHeaderProps> = ({
  children,
  announcementBanner,
  navigation,
  bottomNavigation,
  ...props
}) => {
  return (
    <SimpleMenu
      announcementBanner={announcementBanner}
      navigation={navigation}
      bottomNavigation={bottomNavigation}
      {...props}
    >
      {children}
    </SimpleMenu>
  )
}
