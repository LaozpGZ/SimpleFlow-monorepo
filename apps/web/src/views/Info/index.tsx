import { useTranslation } from '@pancakeswap/localization'
import { SubMenuItems } from '@pancakeswap/uikit'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { multiChainQueryStableClient } from 'state/info/constant'
import { useChainNameByQuery, useMultiChainPath } from 'state/info/hooks'

import InfoNav from './components/InfoNav'

export const InfoPageLayout = ({ children }) => {
  const router = useRouter()
  const chainName = useChainNameByQuery()
  const chainPath = useMultiChainPath()
  const { t } = useTranslation()
  const isStableSwap = router.query.type === 'stableSwap'
  const subMenuItems = useMemo(() => {
    const config = [
      {
        label: t('Infinity'),
        href: `/info/infinity${chainPath}`,
      },
      {
        label: t('V3'),
        href: `/info/v3${chainPath}`,
      },
      {
        label: t('V2'),
        href: `/info${chainPath}`,
      },
    ]
    if (multiChainQueryStableClient[chainName])
      config.push({
        label: t('StableSwap'),
        href: `/info${chainPath}?type=stableSwap`,
      })
    return config
  }, [t, chainPath, chainName])

  const activeItem = useMemo(() => {
    if (router.pathname.includes('infinity')) return `/info/infinity${chainPath}`
    if (router.pathname.includes('v3')) return `/info/v3${chainPath}`
    if (isStableSwap) return `/info${chainPath}?type=stableSwap`
    return `/info${chainPath}`
  }, [router.pathname, chainPath, isStableSwap])

  return (
    <>
      <SubMenuItems items={subMenuItems} activeItem={activeItem} />
      <InfoNav isStableSwap={isStableSwap} />
      {children}
    </>
  )
}
