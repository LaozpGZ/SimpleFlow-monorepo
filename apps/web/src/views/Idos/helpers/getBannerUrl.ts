import { ASSET_CDN } from 'config/constants/endpoints'
import bgImage from '../images/ido-banner.png'

export function getBannerUrl(ifoId: string) {
  return `${ASSET_CDN}/web/ido/bg/${ifoId}-bg.png`
}

export function getTempBannerUrl() {
  return bgImage.src
}
