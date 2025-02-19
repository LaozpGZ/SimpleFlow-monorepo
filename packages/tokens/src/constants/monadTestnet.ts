import { ChainId } from '@pancakeswap/chains'
import { ERC20Token, WETH9 } from '@pancakeswap/sdk'

export const monadTestnetTokens = {
  busd: new ERC20Token(ChainId.MONAD_TESTNET, '0xcf27F781841484d5CF7e155b44954D7224caF1dD', 18, 'BUSD', 'Binance USD'),
  usdc: new ERC20Token(ChainId.MONAD_TESTNET, '0x673cD70FA883394a1f3DEb3221937Ceb7C2618D7', 18, 'USDC', 'USD Coin'),
  weth: WETH9[ChainId.MONAD_TESTNET],
}
