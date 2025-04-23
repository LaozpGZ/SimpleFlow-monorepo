import { useMatchBreakpoints } from '@pancakeswap/uikit'
import { memo } from 'react'
import WithdrawAllButton from '../Buttons/WithdrawAllButton'
import { AfterLockedActionsPropsType } from '../types'

const AfterLockedActions: React.FC<React.PropsWithChildren<AfterLockedActionsPropsType>> = ({ isInline }) => {
  const { isDesktop } = useMatchBreakpoints()
  const isDesktopView = isInline && isDesktop

  return <WithdrawAllButton minWidth={isDesktopView ? '200px' : undefined} />
}

export default memo(AfterLockedActions)
