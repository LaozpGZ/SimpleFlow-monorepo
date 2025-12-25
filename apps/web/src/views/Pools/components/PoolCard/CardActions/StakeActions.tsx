import { Token } from '@simpleflow/sdk'
import { Pool } from '@simpleflow/widgets-internal'
import StakeModal from '../../Modals/StakeModal'

export default Pool.withStakeActions<Token>(StakeModal)
