import { FarmV4SupportedChainId, Protocol, supportedChainIdV4 } from '@pancakeswap/farms'
import { useTranslation } from '@pancakeswap/localization'
import { Box, Card, Flex, Input, InputGroup, SearchIcon } from '@pancakeswap/uikit'
import { DEFAULT_ACTIVE_LIST_URLS } from 'config/constants/lists'
import { useTokenListPrepared } from 'hooks/useTokenListPrepared'
import debounce from 'lodash/debounce'
import { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { TabMenu } from '../../views/BurnDashboard/components/TabMenu'
import { PoolsTable } from './components/PoolsTable'
import { useMiniPoolsData } from './hooks/useMiniPoolsData'

const Container = styled(Box)`
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
`

const SearchWrapper = styled(Flex)`
  gap: 16px;
  flex-wrap: wrap;
  align-items: center;

  ${({ theme }) => theme.mediaQueries.sm} {
    flex-wrap: nowrap;
  }
`

const SearchInputWrapper = styled.div`
  flex: 1;
  min-width: 100%;

  ${({ theme }) => theme.mediaQueries.sm} {
    min-width: 300px;
  }
`

interface MiniUniversalFarmsProps {
  chainIds?: FarmV4SupportedChainId[]
}

const PROTOCOL_FILTERS = [
  { label: 'All', value: null },
  { label: 'Infinity', value: 'infinity' },
  { label: 'V3', value: Protocol.V3 },
  { label: 'V2', value: Protocol.V2 },
  { label: 'StableSwap', value: Protocol.STABLE },
] as const

export const MiniUniversalFarms: React.FC<MiniUniversalFarmsProps> = ({ chainIds }) => {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchText, setSearchText] = useState('')
  const [activeProtocolTab, setActiveProtocolTab] = useState<string>('All')
  const [currentPage, setCurrentPage] = useState(1)

  // Debounced search function
  const debouncedSetSearchQuery = useMemo(() => debounce((val: string) => setSearchQuery(val), 500), [])

  // Handle search input change with debouncing
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchText(e.target.value)
      debouncedSetSearchQuery(e.target.value)
    },
    [debouncedSetSearchQuery],
  )

  // Determine which chains to use
  const chains = useMemo(() => {
    if (chainIds && chainIds.length > 0) return chainIds
    return [...supportedChainIdV4]
  }, [chainIds])

  // Get the selected protocol filter
  const selectedProtocols = useMemo(() => {
    const filter = PROTOCOL_FILTERS.find((f) => f.label === activeProtocolTab)
    if (!filter || !filter.value) return undefined
    if (filter.value === 'infinity') {
      return [Protocol.InfinityCLAMM, Protocol.InfinityBIN]
    }
    return [filter.value]
  }, [activeProtocolTab])

  // Fetch pools data using the simplified hook that leverages Universal Farms
  const { pools, isLoading, error, hasNextPage, resetPagination } = useMiniPoolsData({
    chains,
    protocols: selectedProtocols,
    searchQuery,
    page: currentPage,
    pageSize: 10,
  })

  // Prepare token lists (consistent with Universal Farms)
  const listPrepared = useTokenListPrepared(DEFAULT_ACTIVE_LIST_URLS)

  // Check if we're still loading (include token list preparation)
  const isPending = listPrepared.isPending() || isLoading

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
    resetPagination()
  }, [selectedProtocols, searchQuery, chains, resetPagination])

  // Sync searchText with searchQuery
  useEffect(() => {
    setSearchText(searchQuery)
  }, [searchQuery])

  // Cleanup debounce function on unmount
  useEffect(() => {
    return () => {
      debouncedSetSearchQuery.cancel()
    }
  }, [debouncedSetSearchQuery])

  // Handle load more functionality
  const handleLoadMore = useCallback(async () => {
    if (!hasNextPage) return
    setCurrentPage((prev) => prev + 1)
  }, [hasNextPage])

  // Handle protocol tab change
  const handleProtocolTabChange = useCallback((tab: string) => {
    setActiveProtocolTab(tab)
  }, [])

  // Prepare tabs for the TabMenu
  const protocolTabs = useMemo(() => PROTOCOL_FILTERS.map((filter) => filter.label), [])

  return (
    <Container>
      <Card>
        <Box p="24px">
          <SearchWrapper mb="24px">
            <SearchInputWrapper>
              <InputGroup startIcon={<SearchIcon color="textSubtle" />}>
                <Input placeholder={t('Search pools...')} value={searchText} onChange={handleSearchChange} />
              </InputGroup>
            </SearchInputWrapper>

            <Box minWidth="200px">
              <TabMenu tabs={protocolTabs} defaultTab="All" onTabChange={handleProtocolTabChange} />
            </Box>
          </SearchWrapper>

          <PoolsTable
            pools={pools}
            isLoading={isPending}
            error={error}
            onLoadMore={hasNextPage ? handleLoadMore : undefined}
          />
        </Box>
      </Card>
    </Container>
  )
}
