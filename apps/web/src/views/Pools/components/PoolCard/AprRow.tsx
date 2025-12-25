import { Token } from '@simpleflow/sdk'
import { Pool } from '@simpleflow/widgets-internal'
import BigNumber from 'bignumber.js'
import Apr from 'views/Pools/components/Apr'

interface AprRowProps {
  pool: Pool.DeserializedPool<Token>
  stakedBalance: BigNumber
  performanceFee?: number
  showIcon?: boolean
}

const AprRow: React.FC<React.PropsWithChildren<AprRowProps>> = ({
  pool,
  stakedBalance,
  performanceFee = 0,
  showIcon = true,
}) => {
  return (
    <Pool.AprRowWithToolTip>
      <Apr pool={pool} stakedBalance={stakedBalance} performanceFee={performanceFee} showIcon={showIcon} />
    </Pool.AprRowWithToolTip>
  )
}

export default AprRow
