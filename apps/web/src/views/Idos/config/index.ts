import { BaseIfoConfig } from '@pancakeswap/ifos'
import { bscTokens } from '@pancakeswap/tokens'

export const ifos: BaseIfoConfig[] = [
  {
    id: 'mockIDo',
    version: 8,
    address: '0xa6f907493269BEF3383fF0CBFd25e1Cc35167c3B',
    plannedStartTime: 1727172900,
    plannedEndTime: 1727259300,
    isActive: true,
    name: 'mock IDo',
    description: 'A community-driven blockchain ecosystem of Layer-1 and Layer-2 scaling solutions.',
    currency: bscTokens.bnb,
    token: bscTokens.cake,
    articleUrl: 'https://www.bnbchain.org/en',
    campaignId: '',
    // poolBasic: {
    //   raiseAmount: '$30,000',
    //   additionalClaimingFee: true,
    // },
    poolUnlimited: {
      raiseAmount: '$30,000',
      additionalClaimingFee: true,
    },
    tokenOfferingPrice: 0.6,

    // Enable vestingTitle after IFO is moved to finished
    // vestingTitle: 'Eigenpie IFO',
  },
]
