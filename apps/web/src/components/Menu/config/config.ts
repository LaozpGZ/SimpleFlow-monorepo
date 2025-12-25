import { ChainId } from '@simpleflow/chains'
import { ContextApi } from '@simpleflow/l10n'
import { SUPPORTED_CHAIN_IDS as POOL_SUPPORTED_CHAINS } from '@simpleflow/pools'
import {
  DropdownMenuItems,
  DropdownMenuItemType,
  EarnFillIcon,
  EarnIcon,
  MenuItemsType,
  MoreIcon,
  RocketIcon,
  SwapFillIcon,
  SwapIcon,
  TradeFilledIcon,
  TradeIcon,
} from '@simpleflow/uikit'
import { CHAIN_QUERY_NAME } from 'config/chains'
import { SUPPORT_FARMS, SUPPORT_ONLY_BSC } from 'config/constants/supportChains'
import { getPerpetualUrl } from 'utils/getPerpetualUrl'
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
    // {
    //   label: t('Perps'),
    //   icon: TradeIcon,
    //   fillIcon: TradeFilledIcon,
    //   href: getPerpetualUrl({
    //     chainId,
    //     languageCode,
    //     isDark,
    //   }),
    //   hideSubNav: true,
    //   type: DropdownMenuItemType.EXTERNAL_LINK,
    //   confirmModalId: 'perpConfirmModal',
    //   showItemsOnMobile: false,
    // },
    {
      label: t('Earn.verb'),
      href: '/liquidity/pools',
      icon: EarnIcon,
      fillIcon: EarnFillIcon,
      image: '/images/decorations/pe2.png',
      supportChainIds: SUPPORT_FARMS,
      overrideSubNavItems: [
        {
          label: t('Farm / Liquidity'),
          href: '/liquidity/pools',
          supportChainIds: SUPPORT_FARMS,
        },
        {
          label: t('veSDX Redeem'),
          href: '/cake-staking/redeem',
          supportChainIds: POOL_SUPPORTED_CHAINS,
        },
        // {
        //   label: t('Syrup Pools'),
        //   href: '/pools',
        //   supportChainIds: POOL_SUPPORTED_CHAINS,
        // },
      ].map((item) => addMenuItemSupported(item, chainId)),
      items: [
        {
          label: t('Farm / Liquidity'),
          href: '/liquidity/pools',
          matchHrefs: ['/liquidity/positions', '/farms'],
          supportChainIds: SUPPORT_FARMS,
        },
        {
          label: t('Staking'),
          items: [
            {
              label: t('veSDX Redeem'),
              href: '/cake-staking/redeem',
              supportChainIds: POOL_SUPPORTED_CHAINS,
            },
            // {
            //   label: t('Syrup Pools'),
            //   href: '/pools',
            //   supportChainIds: POOL_SUPPORTED_CHAINS,
            // },
          ].map((item) => addMenuItemSupported(item, chainId)),
        },
      ].map((item) => addMenuItemSupported(item, chainId)),
    },
    // {
    //   label: t('Prob'),
    //   icon: RocketIcon,
    //   href: 'https://probable.markets',
    //   type: DropdownMenuItemType.EXTERNAL_LINK,
    //   hideSubNav: true,
    // },
    // {
    //   label: '',
    //   href: '/info',
    //   icon: MoreIcon,
    //   hideSubNav: true,
    //   items: [
    //     {
    //       label: t('Info.section_title'),
    //       href: '/info/v3',
    //     },
    //     // {
    //     //   label: t('Burn Dashboard'),
    //     //   href: '/burn-dashboard',
    //     // },
    //     // {
    //     //   label: t('CAKE.PAD'),
    //     //   href: '/cakepad',
    //     //   image: '/images/ifos/ifo-bunny.png',
    //     //   overrideSubNavItems: [
    //     //     {
    //     //       label: t('Latest'),
    //     //       href: '/cakepad',
    //     //       matchHrefs: ['/cakepad/deposit'],
    //     //     },
    //     //     {
    //     //       label: t('Finished'),
    //     //       href: '/cakepad/history',
    //     //     },
    //     //   ],
    //     // },
    //     // {
    //     //   label: t('Voting'),
    //     //   image: '/images/voting/voting-bunny.png',
    //     //   href: '/voting',
    //     //   supportChainIds: SUPPORT_ONLY_BSC,
    //     // },
    //     // {
    //     //   type: DropdownMenuItemType.DIVIDER,
    //     // },
    //     // {
    //     //   label: t('Blog'),
    //     //   href: 'https://blog.simpleflow.finance',
    //     //   type: DropdownMenuItemType.EXTERNAL_LINK,
    //     // },
    //     {
    //       label: t('Docs'),
    //       href: 'https://docs.simpleflow.finance',
    //       type: DropdownMenuItemType.EXTERNAL_LINK,
    //     },
    //   ].map((item) => addMenuItemSupported(item, chainId)),
    // },
  ].map((item) => addMenuItemSupported(item, chainId))

export default config
