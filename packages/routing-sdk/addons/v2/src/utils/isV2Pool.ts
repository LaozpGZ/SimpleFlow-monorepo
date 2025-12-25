import type { Pool } from '@simpleflow/routing-sdk'

import { V2Pool } from '../types'
import { V2_POOL_TYPE } from '../constants'

export function isV2Pool(p: Pool): p is V2Pool {
  return p.type === V2_POOL_TYPE
}
