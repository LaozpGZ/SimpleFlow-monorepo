import { ChainId } from '@simpleflow/chains'
import { NATIVE } from '@simpleflow/sdk'
import { simplechainTestnetTokens } from '@simpleflow/tokens'
import { SSRW } from 'config/constants/liquidStaking'
import { FunctionName, LiquidStakingList } from 'views/LiquidStaking/constants/types'
// FAQs
import { SrwSsrwFaq } from 'views/LiquidStaking/constants/FAQs/SrwSsrwFaq'
// ABI
import { sSrwABI } from 'config/abi/sSRW'
import { Abi } from 'viem'

// SimpleChain Testnet - Liquid Staking 配置
const liquidStaking: LiquidStakingList[] = [
  {
    stakingSymbol: 'SRW / sSRW',
    contract: SSRW[ChainId.SIMPLECHAIN_TESTNET],
    token0: NATIVE[ChainId.SIMPLECHAIN_TESTNET],
    token1: simplechainTestnetTokens.ssrw,
    abi: sSrwABI as Abi,
    shouldCheckApproval: false,
    approveToken: null,
    aprUrl: '', // TODO: 添加 APR API URL
    exchangeRateMultiCall: [
      {
        abi: sSrwABI as Abi,
        address: SSRW[ChainId.SIMPLECHAIN_TESTNET],
        functionName: FunctionName.convertSSrwToSrw,
        args: [1000000000000000000n], // 1 sSRW
      },
    ],
    stakingMethodArgs: [],
    requestWithdrawFn: 'requestWithdraw',
    stakingOverrides: ['value'],
    FAQs: SrwSsrwFaq(),
  },
]

export default liquidStaking
