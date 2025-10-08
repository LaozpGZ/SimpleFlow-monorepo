/* eslint-disable react/no-unescaped-entities */
import { ChainId } from '@pancakeswap/chains'
import { Trans } from '@pancakeswap/localization'
import { ASSET_CDN } from 'config/constants/endpoints'
import { IFOConfig } from '../ifov2.types'

export const ifoConfigs: IFOConfig[] = [
  // TODO: IFO v10 testing configuration on Tenderly Virtual Network
  {
    id: 'ifo-presale',
    chainId: ChainId.BSC,
    contractAddress: '0x2b2826CdcC43C20190deCd2198F4736a5c216FDe', // IFO v10 contract address

    icon: `${ASSET_CDN}/web/ifos/v2/whitebridge/logo.png`,
    bannerUrl: `${ASSET_CDN}/web/ifos/v2/whitebridge/bg.png`,
    projectUrl: 'https://www.whitebridge.network/',
    twitterLink: 'https://x.com/AiWhitebridge',

    tgeTitle: <Trans>IFO v10 Test - USDT Offering</Trans>,
    tgeSubtitle: <Trans>Testing IFO V10</Trans>,

    description: (
      <Trans>
        Whitebridge Network is a decentralised people-data intelligence layer that turns scattered public records and
        online signals into trustable, ready-to-use insights.
      </Trans>
    ),

    howTo: [
      {
        title: 'Connect Wallet',
        content: <Trans>Link your wallet on BNB Chain to get started.</Trans>,
      },
      {
        title: 'Commit Funds',
        content: <Trans>During the sale period, commit BNB to buy the offering tokens.</Trans>,
      },
      {
        title: 'Claim Tokens',
        content: <Trans>After the IFO ends, return to claim your purchased USDT.</Trans>,
      },
    ],
  },
]
