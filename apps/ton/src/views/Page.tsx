import { Swap } from 'components/widgets'
import { PropsWithChildren } from 'react'

interface PageProps extends PropsWithChildren {
  removePadding?: boolean
  noMinHeight?: boolean
}
const Page = ({ children, removePadding = false, noMinHeight = false, ...props }: PageProps) => {
  return (
    <Swap.Page removePadding={removePadding} noMinHeight={noMinHeight} {...props}>
      {children}
    </Swap.Page>
  )
}

export default Page
