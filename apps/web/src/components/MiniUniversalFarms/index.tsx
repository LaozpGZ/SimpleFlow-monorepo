import { FarmV4SupportedChainId, Protocol, supportedChainIdV4 } from '@pancakeswap/farms'
import { useTranslation } from '@pancakeswap/localization'
import {
  Box,
  Card,
  Flex,
  Input,
  InputGroup,
  SearchIcon,
  Tab,
  TabMenu,
  Text,
  useMatchBreakpoints,
} from '@pancakeswap/uikit'
import { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { PoolsTable } from './components/PoolsTable'
import { useMiniPoolsData } from './hooks/useMiniPoolsData'

const Container = styled(Box)`
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
`

const SearchWrapper = styled(Flex)`
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;

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

const StyledTabMenu = styled(TabMenu)`
  background: ${({ theme }) => theme.colors.input};
  border-radius: 16px;
  padding: 4px;
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
  const [activeProtocolIndex, setActiveProtocolIndex] = useState(0)

  // Determine which chains to use
  const chains = useMemo(() => {
    if (chainIds && chainIds.length > 0) return chainIds
    return [...supportedChainIdV4]
  }, [chainIds])

  // Get the selected protocol filter
  const selectedProtocols = useMemo(() => {
    const filter = PROTOCOL_FILTERS[activeProtocolIndex]
    if (!filter.value) return undefined
    if (filter.value === 'infinity') {
      return [Protocol.InfinityCLAMM, Protocol.InfinityBIN]
    }
    return [filter.value]
  }, [activeProtocolIndex])

  // Fetch pools data
  const { pools, isLoading, error } = useMiniPoolsData({
    chains,
    protocols: selectedProtocols,
    searchQuery,
  })

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
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
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </InputGroup>
            </SearchInputWrapper>
            <StyledTabMenu activeIndex={activeProtocolIndex} onItemClick={setActiveProtocolIndex}>
              {PROTOCOL_FILTERS.map((filter) => (
                <Tab key={filter.label}>{filter.label}</Tab>
              ))}
            </StyledTabMenu>
          </SearchWrapper>

          <PoolsTable pools={pools} loading={isLoading} />
        </Box>
      </Card>
    </Container>
  )
}
