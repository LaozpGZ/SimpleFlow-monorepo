import { ChainId, getChainName } from '@simpleflow/chains'

import { ASSET_CDN } from 'config/constants/endpoints'

type GetUrlOptions = {
  chainId?: ChainId
  name: string
}

export function getChainBasedImageUrl({ chainId = ChainId.BSC, name }: GetUrlOptions) {
  return `${ASSET_CDN}/web/ifos/${name}/${getChainName(chainId)}.png`
}
