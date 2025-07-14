import { FarmV4SupportedChainId, Protocol, supportedChainIdV4 } from '@pancakeswap/farms'
import { useTranslation } from '@pancakeswap/localization'
import { Box, Card, Flex, Input, InputGroup, SearchIcon, Text, useMatchBreakpoints } from '@pancakeswap/uikit'
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
  const { isMobile } = useMatchBreakpoints()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchText, setSearchText] = useState('')
  const [activeProtocolTab, setActiveProtocolTab] = useState<string>('All')

  // Pagination state (similar to universal farms)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Debounced search function (same as main universal farms)
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

  // Fetch pools data with pagination
  const {
    pools,
    isLoading,
    error,
    hasNextPage,
    resetPagination,
    currentPage: committedPage,
  } = useMiniPoolsData({
    chains,
    protocols: selectedProtocols,
    searchQuery,
    page: currentPage,
    pageSize: 10,
  })

  // Prepare token lists (same as main universal farms)
  const listPrepared = useTokenListPrepared(DEFAULT_ACTIVE_LIST_URLS)

  // Check if we're still loading (include token list preparation)
  const isPending = listPrepared.isPending() || isLoading

  // Reset pagination when filters change
  useEffect(() => {
    console.log('Filters changed, resetting pagination state')
    setCurrentPage(1)
    setIsLoadingMore(false) // Reset loading state as well
    resetPagination()
  }, [selectedProtocols, searchQuery, chains, resetPagination])

  // Sync searchText with searchQuery (same as main universal farms)
  useEffect(() => {
    setSearchText(searchQuery)
  }, [searchQuery])

  // Cleanup debounce function on unmount
  useEffect(() => {
    return () => {
      debouncedSetSearchQuery.cancel()
    }
  }, [debouncedSetSearchQuery])

  // Handle load more functionality (similar to universal farms)
  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasNextPage) {
      console.log(`Skipping load more: isLoadingMore=${isLoadingMore}, hasNextPage=${hasNextPage}`)
      return
    }

    console.log(`Starting load more: current page ${currentPage} -> ${currentPage + 1}`)
    setIsLoadingMore(true)
    try {
      // Use functional update to ensure we get the latest state
      setCurrentPage((prev) => {
        const nextPage = prev + 1
        console.log(`Load more: updating page ${prev} -> ${nextPage}`)
        return nextPage
      })

      // Add a small delay to prevent rapid successive calls
      await new Promise((resolve) => setTimeout(resolve, 200))
    } catch (error) {
      console.error('Error during load more:', error)
    } finally {
      // Only reset loading state after we're confident the operation is done
      setTimeout(() => {
        setIsLoadingMore(false)
      }, 500)
    }
  }, [isLoadingMore, hasNextPage, currentPage])

  // Handle protocol tab change
  const handleProtocolTabChange = useCallback((tab: string) => {
    setActiveProtocolTab(tab)
  }, [])

  // Show error state if there's an error
  if (error) {
    return (
      <Container>
        <Card>
          <Box p={isMobile ? '16px' : '24px'}>
            <Flex
              justifyContent="center"
              alignItems="center"
              minHeight="200px"
              flexDirection="column"
              style={{ gap: '8px' }}
            >
              <Text color="failure" fontSize="16px" fontWeight="600">
                {t('Error loading pools')}
              </Text>
              <Text color="textSubtle" fontSize="14px" textAlign="center">
                {t('There was an error loading pool data. Please try again later.')}
              </Text>
            </Flex>
          </Box>
        </Card>
      </Container>
    )
  }

  return (
    <Container>
      <Card>
        <Box p={isMobile ? '16px' : '24px'}>
          <SearchWrapper>
            <SearchInputWrapper>
              <InputGroup startIcon={<SearchIcon color="textSubtle" />}>
                <Input
                  placeholder={t('Search by token, pool address')}
                  value={searchText}
                  onChange={handleSearchChange}
                />
              </InputGroup>
            </SearchInputWrapper>
            <TabMenu
              tabs={PROTOCOL_FILTERS.map((filter) => filter.label)}
              defaultTab="All"
              onTabChange={handleProtocolTabChange}
            />
          </SearchWrapper>
        </Box>

        <PoolsTable
          pools={pools}
          loading={isPending}
          isExtending={isLoadingMore}
          hasNextPage={hasNextPage}
          onLoadMore={handleLoadMore}
        />
      </Card>
    </Container>
  )
}
