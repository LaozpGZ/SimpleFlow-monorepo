export enum GTMEvent {
  Swap = 'swap',
  SwapTxSent = 'swapTxSent',
  SwapConfirmed = 'swapConfirmed',
  AddLiquidity = 'addLiquidity',
  AddLiquidityConfirmed = 'addLiquidityConfirmed',
  AddLiquidityTxSent = 'addLiquidityTxSent',
  RemoveLiquidity = 'removeLiquidity',
}

export enum GTMCategory {
  Swap = 'Swap',
  AddLiquidity = 'AddLiquidity',
  RemoveLiquidity = 'RemoveLiquidity',
}

export enum GTMAction {
  ClickSwapButton = 'Click Swap Button',
  ClickSwapConfirmButton = 'Click Swap Confirm Button',
  SwapTransactionSent = 'Swap Transaction Sent',
  ClickAddLiquidityConfirmButton = 'Click Add Liquidity Confirm Button',
  AddLiquidityTransactionSent = 'Add Liquidity Transaction Sent',
  ClickAddLiquidityButton = 'Click Add Liquidity Button',
  ClickRemoveLiquidityButton = 'Click Remove Liquidity Button',
}

interface CustomGTMDataLayer {
  event: GTMEvent
  category?: GTMCategory
  action?: GTMAction
  label?: string
}
type WindowWithDataLayer = Window & {
  dataLayer: CustomGTMDataLayer[] | undefined
}
declare const window: WindowWithDataLayer

export const logGTMClickSwapEvent = () => {
  console.info('---Swap---')
  window?.dataLayer?.push({
    event: GTMEvent.Swap,
    action: GTMAction.ClickSwapButton,
    category: GTMCategory.Swap,
  })
}

export const logGTMClickSwapConfirmEvent = () => {
  console.info('---SwapClickConfirm---')
  window?.dataLayer?.push({
    event: GTMEvent.SwapConfirmed,
    action: GTMAction.ClickSwapConfirmButton,
    category: GTMCategory.Swap,
  })
}

export const logGTMSwapTxSentEvent = () => {
  console.info('---SwapTxSent---')
  window?.dataLayer?.push({
    event: GTMEvent.SwapTxSent,
    action: GTMAction.SwapTransactionSent,
    category: GTMCategory.Swap,
  })
}
