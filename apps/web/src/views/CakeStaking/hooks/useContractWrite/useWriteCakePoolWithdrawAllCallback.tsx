import { getCakePoolContract } from 'utils/contractHelpers'
import { createWriteContractCallback } from './createWriteContractCallback'

export const useWriteCakePoolWithdrawAllCallback = createWriteContractCallback(getCakePoolContract, 'withdrawAll')
