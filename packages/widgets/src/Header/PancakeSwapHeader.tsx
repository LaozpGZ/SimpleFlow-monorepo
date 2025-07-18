import { SimpleMenu } from '@pancakeswap/uikit'
import { ReactElement } from 'react'

export type PancakeSwapHeaderProps = React.PropsWithChildren<{
  announcementBanner?: ReactElement
}>

export const PancakeSwapHeader: React.FC<PancakeSwapHeaderProps> = ({ children, announcementBanner }) => {
  return <SimpleMenu announcementBanner={announcementBanner}>{children}</SimpleMenu>
}
