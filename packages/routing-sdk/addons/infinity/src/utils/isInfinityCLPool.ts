import type { Pool } from '@simpleflow/routing-sdk'

import { INFI_CL_POOL_TYPE } from '../constants'
import { InfinityCLPool } from '../types'

export function isInfinityCLPool(p: Pool): p is InfinityCLPool {
  return p.type === INFI_CL_POOL_TYPE
}
