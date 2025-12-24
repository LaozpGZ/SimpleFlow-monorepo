import { ChainId } from '@pancakeswap/chains'
import { ContextApi } from '@pancakeswap/localization'
import { SUPPORTED_CHAIN_IDS as POOL_SUPPORTED_CHAINS } from '@pancakeswap/pools'
import {
  DropdownMenuItems,
  DropdownMenuItemType,
  EarnFillIcon,
  EarnIcon,
  MenuItemsType,
  MoreIcon,
  SwapFillIcon,
  SwapIcon,
} from '@pancakeswap/uikit'
import { CHAIN_QUERY_NAME } from 'config/chains'
import { SUPPORT_FARMS, SUPPORT_ONLY_BSC } from 'config/constants/supportChains'
import { EVM_CHAIN_IDS } from 'utils/wagmi'

export type ConfigMenuDropDownItemsType = DropdownMenuItems & {
  hideSubNav?: boolean
  overrideSubNavItems?: DropdownMenuItems['items']
  matchHrefs?: string[]
}
export type ConfigMenuItemsType = Omit<MenuItemsType, 'items'> & {
  hideSubNav?: boolean
  image?: string
  items?: ConfigMenuDropDownItemsType[]
  overrideSubNavItems?: ConfigMenuDropDownItemsType[]
  type?: DropdownMenuItemType
}

export const addMenuItemSupported = (item, chainId: number | undefined) => {
  if (!chainId || !item.supportChainIds) {
    return item
  }
  if (item.supportChainIds?.includes(chainId)) {
    return item
  }
  // if unsupported chain, redirect to bsc
  if (item?.href) {
    return {
      ...item,
      href: `${item.href}?chain=${CHAIN_QUERY_NAME[ChainId.BSC]}`,
    }
  }
  return item
}

const config: (
  t: ContextApi['t'],
  isDark: boolean,
  languageCode?: string,
  chainId?: number,
) => ConfigMenuItemsType[] = (t, isDark, languageCode, chainId) =>
  [
    {
      label: t('Trade'),
      icon: SwapIcon,
      fillIcon: SwapFillIcon,
      href: '/swap',
      hideSubNav: true,
      items: [
        {
          label: t('Swap'),
          href: '/swap',
        },
        {
          label: t('TWAP'),
          href: '/swap/twap',
          display: false,
        },
        {
          label: t('Limit Orders'),
          href: '/swap/limit',
          display: false,
        },
        {
          label: t('Buy Crypto'),
          href: '/buy-crypto',
          supportChainIds: EVM_CHAIN_IDS,
        },
      ].map((item) => addMenuItemSupported(item, chainId)),
    },
    {
      label: t('Dashboard'),
      href: '/info/v3',
      icon: MoreIcon,
      hideSubNav: true,
    },
    {
      label: t('LP'),
      href: '/liquidity/select',
      icon: MoreIcon,
      hideSubNav: true,
      items: [
        {
          label: t('Create Pool'),
          href: '/liquidity/create',
        },
        {
          label: t('Add Liquidity'),
          href: '/add',
        },
      ],
    },
    {
      label: t('Farm / Liquidity'),
      href: '/liquidity/pools',
      icon: EarnIcon,
      fillIcon: EarnFillIcon,
      hideSubNav: true,
      supportChainIds: SUPPORT_FARMS,
    },
    {
      label: t('Portfolio'),
      href: '/portfolio',
      icon: EarnIcon,
      hideSubNav: true,
    },
    {
      label: t('Leaderboard'),
      href: '/leaderboard',
      icon: MoreIcon,
      hideSubNav: true,
    },
  ].map((item) => addMenuItemSupported(item, chainId))

export default config
