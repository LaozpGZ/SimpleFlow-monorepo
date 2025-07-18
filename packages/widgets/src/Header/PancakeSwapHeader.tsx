import { SimpleMenu } from '@pancakeswap/uikit'
import { ReactElement } from 'react'

export type PancakeSwapHeaderProps = React.PropsWithChildren<{
  announcementBanner?: ReactElement
  navigation?: ReactElement
  [key: string]: any
}>

export const PancakeSwapHeader: React.FC<PancakeSwapHeaderProps> = ({
  children,
  announcementBanner,
  navigation,
  ...props
}) => {
  return (
    <SimpleMenu announcementBanner={announcementBanner} navigation={navigation} {...props}>
      {children}
    </SimpleMenu>
  )
}
