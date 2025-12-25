import { useTranslation } from '@simpleflow/l10n'
import { SubMenuItems } from '@simpleflow/uikit'
import { useMemo } from 'react'
import { multiChainQueryStableClient } from 'state/info/constant'
import { useChainNameByQuery, useMultiChainPath } from 'state/info/hooks'
import InfoNav from './InfoNav'

export const InfoPageLayout = ({ children }: { children?: React.ReactNode }) => {
  const chainName = useChainNameByQuery()
  const chainPath = useMultiChainPath()
  const { t } = useTranslation()
  const activeItem = `/info/infinity${chainPath}`

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

  return (
    <>
      <SubMenuItems items={subMenuItems} activeItem={activeItem} />
      <InfoNav isStableSwap={false} />
      {children}
    </>
  )
}
