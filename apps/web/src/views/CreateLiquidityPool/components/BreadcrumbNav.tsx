import { useTranslation } from '@pancakeswap/localization'
import { Box, Breadcrumbs, Link, Text } from '@pancakeswap/uikit'
import { useRouter } from 'next/router'
import { NextLinkFromReactRouter } from '@pancakeswap/widgets-internal'
import { useSelectIdRoute } from 'hooks/dynamicRoute/useSelectIdRoute'
import { useCallback } from 'react'
import styled from 'styled-components'
import { TabMenu } from 'views/BurnDashboard/components/TabMenu'
import { useActiveChainId } from 'hooks/useActiveChainId'

const StyledLink = styled(NextLinkFromReactRouter)`
  &:hover {
    text-decoration: underline;
  }
`

// @todo @ChefJerry UI no match with design
export const BreadcrumbNav: React.FC = () => {
  const router = useRouter()
  const { t } = useTranslation()
  const { chainId } = useActiveChainId()

  const { protocolName, routeParams } = useSelectIdRoute()

  const handleProtocolChange = useCallback(
    (protocol: 'infinity' | 'v3' | 'v2') => {
      const currencyIdA = routeParams?.selectId?.[2]
      const currencyIdB = routeParams?.selectId?.[3]
      if (currencyIdA && currencyIdB) {
        router.push(`/liquidity/create/${chainId}/${protocol}/${currencyIdA}/${currencyIdB}`)
      } else router.push(`/liquidity/create/${chainId}/${protocol}`)
    },
    [router, chainId, routeParams],
  )

  return (
    <Breadcrumbs mb="32px">
      <Link href="/liquidity/pools">
        <Text color="primary60">{t('Farms')}</Text>
      </Link>
      <StyledLink to="/liquidity/create">
        <Text color="primary60">{t('Create Liquidity Pool')}</Text>
      </StyledLink>
      <Box>
        <TabMenu
          tabs={['infinity', 'v3', 'v2']}
          defaultTab={protocolName as 'infinity' | 'v3' | 'v2'}
          onTabChange={handleProtocolChange}
        />
      </Box>
    </Breadcrumbs>
  )
}
