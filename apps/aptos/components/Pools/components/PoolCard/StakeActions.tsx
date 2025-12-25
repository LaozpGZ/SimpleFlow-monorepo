import { Token } from '@simpleflow/swap-sdk-core'
import { Pool } from '@simpleflow/widgets-internal'
import StakeModal from './StakeModal'

export default Pool.withStakeActions<Token>(StakeModal)
