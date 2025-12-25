import { Token } from '@simpleflow/aptos-swap-sdk'
import { TransactionResponse } from '@simpleflow/awgmi/core'
import { useMatchBreakpoints } from '@simpleflow/uikit'
import { FarmWidget } from '@simpleflow/widgets-internal'
import BigNumber from 'bignumber.js'
import useHarvestFarm from '../../../hooks/useHarvestFarm'
import HarvestAction from '../../FarmCard/HarvestAction'

const { ActionContainer } = FarmWidget.FarmTable

interface TableHarvestActionProps {
  pid?: number
  earnings?: BigNumber
  dual?: {
    token: Token
  }
  earningsDualTokenBalance?: BigNumber
  onReward: () => Promise<TransactionResponse>
  onDone?: () => void
}

export const HarvestActionContainer = ({ children, ...props }) => {
  const { onReward } = useHarvestFarm(props.lpAddress)

  return children({ ...props, onReward })
}

export const TableHarvestAction: React.FunctionComponent<React.PropsWithChildren<TableHarvestActionProps>> = ({
  pid,
  earnings,
  dual,
  earningsDualTokenBalance,
  onReward,
}) => {
  const { isDesktop } = useMatchBreakpoints()

  return (
    <ActionContainer style={{ minHeight: isDesktop ? 124.5 : 'auto' }}>
      <HarvestAction
        isTableView
        pid={pid}
        earnings={earnings}
        dual={dual}
        earningsDualTokenBalance={earningsDualTokenBalance}
        onReward={onReward}
      />
    </ActionContainer>
  )
}

export default HarvestAction
