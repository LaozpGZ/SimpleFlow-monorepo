import { Trans } from '@pancakeswap/localization'

const LIQUIDITY_TX_MSG = (props?: Record<string, unknown>) => ({
  addLiquidity: {
    title: <Trans values={props}>Add Liquidity</Trans>,
    desc: <Trans values={props}>Added %amountA% %symbolA% and %amountB% %symbolB%.</Trans>,
    txHistoryTitle: <Trans values={props}>Add Liquidity</Trans>,
    txHistoryDesc: <Trans values={props}>Added %amountA% %symbolA% and %amountB% %symbolB%.</Trans>
  },
  removeLiquidity: {
    title: <Trans values={props}>Remove Liquidity</Trans>,
    desc: <Trans values={props}>Removed %amountA% %symbolA% and %amountB% %symbolB%.</Trans>,
    txHistoryTitle: <Trans values={props}>Remove Liquidity</Trans>,
    txHistoryDesc: <Trans values={props}>Removed %amountA% %symbolA% and %amountB% %symbolB%.</Trans>
  },
  createPool: {
    title: <Trans values={props}>Create pool</Trans>,
    desc: <Trans values={props}>create %mintA% - %mintB% pool</Trans>,
    txHistoryTitle: '',
    txHistoryDesc: ''
  },
  removeLpBeforeMigrate: {
    title: <Trans values={props}>Remove Liquidity</Trans>,
    desc: <Trans values={props}>Remove Liquidity</Trans>,
    txHistoryTitle: '',
    txHistoryDesc: ''
  },
  migrateToClmm: {
    title: <Trans values={props}>Migrate to CLMM</Trans>,
    desc: <Trans values={props}>Migrate %mint% to CLMM position.</Trans>,
    txHistoryTitle: '',
    txHistoryDesc: ''
  },
  lockLp: {
    title: <Trans values={props}>Lock Position</Trans>,
    desc: <Trans values={props}>Position %position% locked</Trans>,
    txHistoryTitle: <Trans values={props}>Lock Position</Trans>,
    txHistoryDesc: <Trans values={props}>Position %position% locked</Trans>
  },
  harvestLock: {
    title: <Trans values={props}>Harvested Rewards</Trans>,
    desc: <Trans values={props}>Harvest Locked Position Rewards</Trans>,
    txHistoryTitle: <Trans values={props}>Harvested Rewards</Trans>,
    txHistoryDesc: <Trans values={props}>Harvest Locked Position Rewards</Trans>
  }
})

export const getTxMeta = ({
  action,
  values = {}
}: {
  action: keyof ReturnType<typeof LIQUIDITY_TX_MSG>
  values?: Record<string, unknown>
}) => {
  const meta = LIQUIDITY_TX_MSG(values)[action]
  return {
    title: meta.title,
    description: meta.desc,
    txHistoryTitle: meta.txHistoryTitle || meta.title,
    txHistoryDesc: meta.txHistoryDesc || meta.desc,
    txValues: values
  }
}
