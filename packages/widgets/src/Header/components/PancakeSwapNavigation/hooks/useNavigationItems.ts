import { useTheme } from '@pancakeswap/hooks'
import { useTranslation } from '@pancakeswap/localization'
import { useMemo } from 'react'
import { getNavigationConfig, NavigationDropdownItem, NavigationItem } from '../config/getConfig'

export type UseNavigationItemsParams = {
  chainId?: number
  onClick?: (e: React.MouseEvent<HTMLElement>, item: NavigationDropdownItem) => void
}

const traverseNavigationItem = <T extends NavigationItem | NavigationDropdownItem>({
  item,
  onClick,
  t,
  chainId,
}: {
  item: T
  onClick?: (e: React.MouseEvent<HTMLElement>, item: T) => void
  t: (key: string) => string
  chainId?: number
}): T => {
  if (item?.items && item.items.length > 0) {
    const innerItems = item.items.map((currentItem) =>
      traverseNavigationItem({
        item: currentItem as T,
        onClick,
        t,
        chainId,
      }),
    )
    return { ...item, items: innerItems }
  }

  const onClickEvent = (e: React.MouseEvent<HTMLButtonElement>) => {
    item.onClick?.(e)
    onClick?.(e, item)
  }

  return { ...item, onClick: onClickEvent }
}

export const useNavigationItems = ({ chainId, onClick }: UseNavigationItemsParams): NavigationItem[] => {
  const {
    t,
    currentLanguage: { code: languageCode },
  } = useTranslation()
  const { isDark } = useTheme()

  const navigationItems = useMemo(
    () =>
      getNavigationConfig({
        t,
        isDark,
        languageCode,
        chainId,
      }),
    [t, isDark, languageCode, chainId],
  )

  return useMemo(() => {
    return navigationItems.map((item) =>
      traverseNavigationItem({
        item,
        onClick,
        t,
        chainId,
      }),
    )
  }, [navigationItems, onClick, t, chainId])
}
