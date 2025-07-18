import { useNavigationItems } from '../hooks/useNavigationItems'

export function getItemsLinks(items: ReturnType<typeof useNavigationItems>) {
  return items.map((item) => {
    return {
      ...item,
      href: item.href ?? '',
      items: item.items?.map((subItem) => {
        const { matchHrefs: _1, overrideSubNavItems: _2, ...rest } = subItem
        return rest
      }),
    }
  })
}
