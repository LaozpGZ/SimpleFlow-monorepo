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

    contractAddress: '0xD8210a960f0F15778e00C62Dad14D3319712e5cb', // Production contract

    icon: `${ASSET_CDN}/web/ifos/v2/whitebridge/logo.png`,
    bannerUrl: `${ASSET_CDN}/web/ifos/v2/whitebridge/bg.png`,
    projectUrl: 'https://www.whitebridge.network/',
    twitterLink: 'https://x.com/AiWhitebridge',

    tgeTitle: <Trans>Whitebridge Network</Trans>,

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

    // Preset data until we get the production contract address
    // presetData: {
    //   startTimestamp: 1760439600,
    //   endTimestamp: 1760526000,
    //   offeringCurrency: new Token(ChainId.BSC, '0x', 18, 'WBAI', 'Whitebridge'),
    //   totalSalesAmount: 20_000_000,
    //   stakeCurrency0: CAKE[ChainId.BSC],
    //   preSaleDurationText: '1 Day',
    //   pools: [
    //     {
    //       pid: 0,
    //       stakeCurrency: CAKE[ChainId.BSC],
    //       pricePerToken: '$0.008',
    //       raiseAmountText: '$160,000',
    //     },
    //   ],
    // },
  },
]
