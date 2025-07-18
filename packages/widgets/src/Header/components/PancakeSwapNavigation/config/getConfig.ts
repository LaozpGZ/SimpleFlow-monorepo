import { ChainId } from '@pancakeswap/chains'
import {
  BridgeIcon,
  DropdownMenuItems,
  DropdownMenuItemType,
  EarnFillIcon,
  EarnIcon,
  GameIcon,
  type MenuItemsType,
  MoreIcon,
  SwapFillIcon,
  SwapIcon,
} from '@pancakeswap/uikit'
import { getPerpetualUrl } from '../utils/getPerpetualUrl'
import {
  POOL_SUPPORTED_CHAINS,
  POSITION_MANAGERS_SUPPORTED_CHAINS,
  PREDICTION_SUPPORTED_CHAINS,
  SUPPORT_FARMS,
} from './supportChains'

type GetNavigationConfigParameters = {
  t: (key: string) => string
  isDark?: boolean
  languageCode?: string
  chainId?: number
}

export type NavigationDropdownItem = DropdownMenuItems & {
  hideSubNav?: boolean
  overrideSubNavItems?: DropdownMenuItems['items']
  matchHrefs?: string[]
}

export type NavigationItem = Omit<MenuItemsType, 'items' | 'href' | 'label'> & {
  label: string
  supportChainIds?: readonly number[]
  hideSubNav?: boolean
  image?: string
  overrideSubNavItems?: NavigationDropdownItem[]
} & (
    | {
        href?: string
        items: NavigationDropdownItem[]
      }
    | {
        href: string
        items?: NavigationDropdownItem[]
      }
  )

export const addMenuItemSupported = (item: NavigationItem, chainId?: number) => {
  if (!chainId || !('supportChainIds' in item)) {
    return item
  }
  if (item.supportChainIds?.includes(chainId)) {
    return item
  }
  return {
    ...item,
    disabled: true,
  }
}

export function getNavigationConfig({ t, isDark = false, languageCode, chainId }: GetNavigationConfigParameters) {
  return [
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
          label: t('Perps'),
          href: getPerpetualUrl({
            chainId,
            languageCode,
            isDark,
          }),
          confirmModalId: 'perpConfirmModal',
          type: DropdownMenuItemType.EXTERNAL_LINK,
        },
        {
          label: t('Buy Crypto'),
          href: '/buy-crypto',
        },
      ].map((item) => addMenuItemSupported(item, chainId)),
    },
    {
      label: t('Earn'),
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
          label: t('Position Manager'),
          href: '/position-managers',
          supportChainIds: POSITION_MANAGERS_SUPPORTED_CHAINS,
        },
        {
          label: t('veCake Redeem'),
          href: '/cake-staking/redeem',
          supportChainIds: POOL_SUPPORTED_CHAINS,
        },
        {
          label: t('Syrup Pools'),
          href: '/pools',
          supportChainIds: POOL_SUPPORTED_CHAINS,
        },
      ].map((item) => addMenuItemSupported(item, chainId)),
      items: [
        {
          label: t('Farm / Liquidity'),
          href: '/liquidity/pools',
          matchHrefs: ['/liquidity/positions', '/farms'],
          supportChainIds: SUPPORT_FARMS,
        },
        {
          label: t('Position Manager'),
          href: '/position-managers',
          supportChainIds: POSITION_MANAGERS_SUPPORTED_CHAINS,
        },
        {
          label: t('Staking'),
          items: [
            {
              label: t('veCake Redeem'),
              href: '/cake-staking/redeem',
              supportChainIds: POOL_SUPPORTED_CHAINS,
            },
            {
              label: t('Syrup Pools'),
              href: '/pools',
              supportChainIds: POOL_SUPPORTED_CHAINS,
            },
          ].map((item) => addMenuItemSupported(item, chainId)),
        },
      ].map((item) => addMenuItemSupported(item, chainId)),
    },
    {
      label: t('Bridge'),
      href: '/bridge',
      icon: BridgeIcon,
      type: DropdownMenuItemType.EXTERNAL_LINK,
      image: '/images/decorations/pe2.png',
      showItemsOnMobile: false,
    },
    {
      label: t('Play'),
      icon: GameIcon,
      href: '/prediction',
      overrideSubNavItems: [
        {
          label: t('Prediction'),
          href: '/prediction',
        },
        {
          label: t('Lottery'),
          href: '/lottery',
        },
      ],
      items: [
        {
          label: t('Springboard'),
          href: 'https://springboard.pancakeswap.finance',
          type: DropdownMenuItemType.EXTERNAL_LINK,
        },
        {
          label: t('Prediction'),
          href: '/prediction',
          image: '/images/decorations/prediction.png',
          supportChainIds: PREDICTION_SUPPORTED_CHAINS,
        },
        {
          label: t('Lottery'),
          href: '/lottery',
          image: '/images/decorations/lottery.png',
        },
      ].map((item) => addMenuItemSupported(item, chainId)),
    },
    {
      label: '',
      href: '/info',
      icon: MoreIcon,
      hideSubNav: true,
      items: [
        {
          label: t('Info'),
          href: '/info/v3',
        },
        {
          label: t('Burn Dashboard'),
          href: '/burn-dashboard',
        },
        {
          label: t('IFO'),
          href: '/ifo',
          image: '/images/ifos/ifo-bunny.png',
          overrideSubNavItems: [
            {
              label: t('Latest'),
              href: '/ifo',
            },
            {
              label: t('Finished'),
              href: '/ifo/history',
            },
          ],
        },
        {
          label: t('Voting'),
          image: '/images/voting/voting-bunny.png',
          href: '/voting',
          supportChainIds: [ChainId.BSC],
        },
        {
          type: DropdownMenuItemType.DIVIDER,
        } as unknown as NavigationItem,
        {
          label: t('Blog'),
          href: 'https://blog.pancakeswap.finance',
          type: DropdownMenuItemType.EXTERNAL_LINK,
        },
        {
          label: t('Docs'),
          href: 'https://docs.pancakeswap.finance',
          type: DropdownMenuItemType.EXTERNAL_LINK,
        },
      ].map((item) => addMenuItemSupported(item, chainId)),
    },
  ].map((item) => addMenuItemSupported(item, chainId))
}
