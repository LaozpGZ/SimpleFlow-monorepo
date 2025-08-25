import { ChainId } from '@pancakeswap/chains'
import { Native } from '@pancakeswap/sdk'
import { bscTokens } from '@pancakeswap/tokens'
import { chainlinkOracleETH, chainlinkOracleWBTC } from '../../chainlinkOracleContract'
import { GRAPH_API_PREDICTION_ETH, GRAPH_API_PREDICTION_WBTC } from '../../endpoints'
import { predictionsETH, predictionsWBTC } from '../../predictionContract'
import { PredictionConfig, PredictionSupportedSymbol } from '../../type'

export const predictions: Record<string, PredictionConfig> = {
  [PredictionSupportedSymbol.ETH]: {
    betCurrency: Native.onChain(ChainId.BSC_TESTNET),
    predictionCurrency: bscTokens.eth,

    address: predictionsETH[ChainId.BSC_TESTNET],
    api: GRAPH_API_PREDICTION_ETH[ChainId.BSC_TESTNET],
    chainlinkOracleAddress: chainlinkOracleETH[ChainId.BSC_TESTNET],

    displayedDecimals: 4,
    tokenBackgroundColor: '#F0B90B',
  },
  [PredictionSupportedSymbol.WBTC]: {
    betCurrency: Native.onChain(ChainId.BSC_TESTNET),
    predictionCurrency: bscTokens.wBTC,

    address: predictionsWBTC[ChainId.BSC_TESTNET],
    api: GRAPH_API_PREDICTION_WBTC[ChainId.BSC_TESTNET],
    chainlinkOracleAddress: chainlinkOracleWBTC[ChainId.BSC_TESTNET],

    displayedDecimals: 4,
    tokenBackgroundColor: '#25C7D6',
  },
}
