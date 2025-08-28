import { ChainId } from '@pancakeswap/chains'
import { Native } from '@pancakeswap/sdk'
import { bscTokens } from '@pancakeswap/tokens'
import { chainlinkOracleBNB, chainlinkOracleCAKE } from '../../chainlinkOracleContract'
import { GRAPH_API_PREDICTION_BNB, GRAPH_API_PREDICTION_CAKE } from '../../endpoints'
import { predictionsBNB, predictionsCAKE } from '../../predictionContract'
import { PredictionConfig, PredictionContractVersion, PredictionSupportedSymbol } from '../../type'

export const predictions: Record<string, PredictionConfig> = {
  [PredictionSupportedSymbol.BNB]: {
    version: PredictionContractVersion.V2,

    betCurrency: Native.onChain(ChainId.BSC),
    predictionCurrency: Native.onChain(ChainId.BSC),

    address: predictionsBNB[ChainId.BSC],
    api: GRAPH_API_PREDICTION_BNB[ChainId.BSC],
    chainlinkOracleAddress: chainlinkOracleBNB[ChainId.BSC],

    displayedDecimals: 4,
    tokenBackgroundColor: '#F0B90B',
  },
  [PredictionSupportedSymbol.CAKE]: {
    version: PredictionContractVersion.V3,

    betCurrency: bscTokens.cake,
    predictionCurrency: bscTokens.cake,

    address: predictionsCAKE[ChainId.BSC],
    api: GRAPH_API_PREDICTION_CAKE[ChainId.BSC],
    chainlinkOracleAddress: chainlinkOracleCAKE[ChainId.BSC],

    displayedDecimals: 4,
    tokenBackgroundColor: '#25C7D6',
  },
}
