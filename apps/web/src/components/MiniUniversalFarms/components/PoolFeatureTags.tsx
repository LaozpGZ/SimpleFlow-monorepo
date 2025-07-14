import { Protocol } from '@pancakeswap/farms'
import { Flex, Tag } from '@pancakeswap/uikit'
import { useMemo } from 'react'
import { PoolInfo } from 'state/farmsV4/state/type'
import { isInfinityProtocol } from 'utils/protocols'

interface PoolFeatureTagsProps {
  pool: PoolInfo
}

interface TagItem {
  label: string
  variant: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'textSubtle' | 'textDisabled'
}

export const PoolFeatureTags: React.FC<PoolFeatureTagsProps> = ({ pool }) => {
  const tags = useMemo(() => {
    const tagList: TagItem[] = []

    // Protocol tag
    if (pool.protocol === Protocol.InfinityCLAMM || pool.protocol === Protocol.InfinityBIN) {
      tagList.push({ label: 'Infinity', variant: 'secondary' })
    } else if (pool.protocol === Protocol.V3) {
      tagList.push({ label: 'V3', variant: 'primary' })
    } else if (pool.protocol === Protocol.V2) {
      tagList.push({ label: 'V2', variant: 'secondary' })
    } else if (pool.protocol === Protocol.STABLE) {
      tagList.push({ label: 'StableSwap', variant: 'success' })
    }

    // Fee tier
    if (pool.feeTier && pool.feeTierBase) {
      const feePercent = (pool.feeTier / pool.feeTierBase) * 100
      tagList.push({ label: `${feePercent}%`, variant: 'secondary' })
    }

    // Add pool features for Infinity pools
    if (isInfinityProtocol(pool.protocol)) {
      tagList.push({ label: 'Pool feature +N', variant: 'secondary' })
    }

    return tagList
  }, [pool])

  return (
    <Flex flexWrap="wrap" style={{ gap: '4px' }}>
      {tags.map((tag, index) => (
        <Tag key={`${tag.label}-${index}`} variant={tag.variant} scale="sm" outline>
          {tag.label}
        </Tag>
      ))}
    </Flex>
  )
}
