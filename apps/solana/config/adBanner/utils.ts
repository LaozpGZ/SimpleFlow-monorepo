import { ASSETS_CDN } from 'config/constant'
import memoize from 'lodash/memoize'

const AD_ASSETS_URL = `${ASSETS_CDN}/web/promotions`

export const getImageUrl = memoize((asset: string) => `${AD_ASSETS_URL}/${asset}.png`)
