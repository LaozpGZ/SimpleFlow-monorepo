import { useTranslation } from '@pancakeswap/localization'
import { SubMenuItems } from '@pancakeswap/uikit'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { useMultiChainPath } from 'state/info/hooks'

import InfoNav from './components/InfoNav'

export const InfoPageLayout = ({ children }: { children?: React.ReactNode }) => {
  const router = useRouter()
  const chainPath = useMultiChainPath()
  const { t } = useTranslation()
  const isStableSwap = router.query.type === 'stableSwap'

  const subMenuItems = useMemo(() => {
    return [
      {
        label: t('V3'),
        href: `/info/v3${chainPath}`,
      },
    ]
  }, [t, chainPath])

  const activeItem = useMemo(() => {
    if (router.pathname.includes('v3')) return `/info/v3${chainPath}`
    return `/info${chainPath}`
  }, [router.pathname, chainPath])

  return (
    <>
      <SubMenuItems items={subMenuItems} activeItem={activeItem} />
      <InfoNav isStableSwap={isStableSwap} />
      {children}
    </>
  )
}
