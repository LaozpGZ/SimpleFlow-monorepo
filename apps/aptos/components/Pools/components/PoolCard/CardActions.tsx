import { Pool } from '@simpleflow/widgets-internal'
import { Coin } from '@simpleflow/aptos-swap-sdk'
import StakeActions from './StakeActions'
import HarvestActions from './HarvestActions'

export default Pool.withCardActions<Coin>(HarvestActions, StakeActions)
