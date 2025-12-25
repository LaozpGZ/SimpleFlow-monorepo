import { ChainId } from '@simpleflow/chains'
import { useMemo } from 'react'
import { createPortal } from 'react-dom'

import { getPortalRoot } from '@simpleflow/uikit'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { SubgraphHealthIndicator, SubgraphHealthIndicatorProps } from './SubgraphHealthIndicator'

interface FactoryParams {
  getSubgraph: (chainId: ChainId) => string
  checkApiInstead?: boolean
}

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export function subgraphHealthIndicatorFactory({ getSubgraph, checkApiInstead }: FactoryParams) {
  return function Indicator(props: PartialBy<SubgraphHealthIndicatorProps, 'subgraph' | 'chainId'>) {
    const { chainId } = useActiveChainId()

    const subgraph = useMemo(() => {
      if (props.chainId) {
        return getSubgraph(props.chainId)
      }
      if (chainId) {
        return getSubgraph(chainId)
      }
      return undefined
    }, [chainId, props?.chainId])

    if (!subgraph) {
      return null
    }

    const portalRoot = getPortalRoot()

    return portalRoot
      ? createPortal(
          <SubgraphHealthIndicator
            chainId={chainId}
            subgraph={subgraph}
            checkApiInstead={checkApiInstead}
            {...props}
          />,
          portalRoot,
        )
      : null
  }
}
