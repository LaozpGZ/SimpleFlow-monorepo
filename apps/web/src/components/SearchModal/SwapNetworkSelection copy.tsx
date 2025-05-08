import { ChainId } from '@pancakeswap/chains'
import { useTranslation } from '@pancakeswap/localization'
import { AutoColumn, AutoRow, Flex, InlineMenu, Text } from '@pancakeswap/uikit'
import { ChainLogo } from '@pancakeswap/widgets-internal'
import { useActiveChainId } from 'hooks/useActiveChainId'
import drop from 'lodash/drop'
import take from 'lodash/take'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { styled } from 'styled-components'
import { chainNameConverter } from 'utils/chainNameConverter'
import { chains as evmChains } from 'utils/wagmi'
import { BaseWrapper, ButtonWrapper, RowWrapper } from './CommonBases'

// Constants for width calculations
const CONTAINER_MAX_WIDTH = 370
const CHAIN_BUTTON_WIDTH = 42
const CHAIN_BUTTON_MARGIN = 4
const HIDDEN_CHAINS_BUTTON_WIDTH = CHAIN_BUTTON_WIDTH
const CHAIN_LOGO_WIDTH = 24

const ChainOption = styled(Flex)`
  padding: 8px 16px;
  &:hover {
    cursor: pointer;
    background-color: ${({ theme }) => theme.colors.background};
  }
  transition: background-color 0.15s;
`

// Wrap BaseWrapper with a div that can handle the transition
const AnimatedWrapperDiv = styled.div<{ $width?: number }>`
  transition: width 0.3s ease;
  width: ${({ $width }) => ($width ? `${$width}px` : 'auto')};
  overflow: hidden;
  display: flex;
  align-items: center;
`

export default function SwapNetworkSelection({
  chainId,
  onSelect,
  showTestnet,
}: {
  showTestnet?: boolean
  chainId?: ChainId
  onSelect: (chainId: ChainId) => void
}) {
  const { chainId: activeChainId } = useActiveChainId()

  const usedChainId = chainId ?? activeChainId

  const { t } = useTranslation()

  const selectedChain = useMemo(() => evmChains.find((chain) => chain.id === usedChainId), [usedChainId])

  const selectedChainRef = useRef<HTMLDivElement>(null)
  const selectedTextRef = useRef<HTMLDivElement>(null)
  const [selectedChainWidth, setSelectedChainWidth] = useState(0)
  const [wrapperWidth, setWrapperWidth] = useState(0)

  // Measure the width of the selected chain button dynamically based on text content
  useLayoutEffect(() => {
    if (selectedChainRef.current && selectedTextRef.current) {
      const textWidth = selectedTextRef.current.getBoundingClientRect().width
      // Add 4px to make logo size 24px consistent with other logos
      const totalWidth = CHAIN_LOGO_WIDTH + textWidth + 4
      setSelectedChainWidth(totalWidth + CHAIN_BUTTON_MARGIN)
      setWrapperWidth(totalWidth)
    }
  }, [selectedChain])

  const [_, shownChains, hiddenChains] = useMemo(() => {
    const filtered = evmChains.filter((chain) => {
      if (chain.id === usedChainId) return false
      if ('testnet' in chain && chain.testnet && chain.id !== ChainId.MONAD_TESTNET) {
        return showTestnet
      }
      return true
    })

    // Calculate available width and how many chains can fit
    const availableWidth = CONTAINER_MAX_WIDTH - selectedChainWidth - HIDDEN_CHAINS_BUTTON_WIDTH - CHAIN_BUTTON_MARGIN
    const chainsToShow = Math.max(1, Math.floor(availableWidth / (CHAIN_BUTTON_WIDTH + CHAIN_BUTTON_MARGIN)))

    // Prioritize BSC, BASE, and ARB chains
    const prioritizedChains = [ChainId.BSC, ChainId.BASE, ChainId.ARBITRUM_ONE]

    // Sort the filtered chains to have priority chains first
    const sortedFiltered = [...filtered].sort((a, b) => {
      const aIsPriority = prioritizedChains.includes(a.id)
      const bIsPriority = prioritizedChains.includes(b.id)

      if (aIsPriority && !bIsPriority) return -1
      if (!aIsPriority && bIsPriority) return 1

      // If both are priority chains, sort by the order in prioritizedChains array
      if (aIsPriority && bIsPriority) {
        return prioritizedChains.indexOf(a.id) - prioritizedChains.indexOf(b.id)
      }

      return 0
    })

    return [filtered, take(sortedFiltered, chainsToShow), drop(sortedFiltered, chainsToShow)]
  }, [usedChainId, showTestnet, selectedChainWidth])

  return (
    <AutoColumn gap="sm" style={{ maxWidth: `${CONTAINER_MAX_WIDTH}px` }}>
      <AutoRow>
        <Text color="textSubtle" fontSize="14px">
          {t('Network')}
        </Text>
      </AutoRow>
      <RowWrapper>
        {selectedChain ? (
          <ButtonWrapper style={{ marginRight: `${CHAIN_BUTTON_MARGIN}px` }} ref={selectedChainRef}>
            <BaseWrapper style={{ minHeight: '44.5px' }} id="selected-chain-wrapper" disable>
              <AnimatedWrapperDiv $width={wrapperWidth}>
                <ChainLogo
                  chainId={selectedChain.id}
                  style={{
                    position: 'relative',
                    top: '2px',
                  }}
                  pl="4px"
                />
                <Text color="inherit" px="6px" ref={selectedTextRef}>
                  {chainNameConverter(selectedChain.name)}
                </Text>
              </AnimatedWrapperDiv>
            </BaseWrapper>
          </ButtonWrapper>
        ) : null}

        {shownChains.map((chain) => {
          return (
            <ButtonWrapper key={`buttonNetworkSelect#${chain.id}`} style={{ marginRight: `${CHAIN_BUTTON_MARGIN}px` }}>
              <BaseWrapper onClick={() => onSelect(chain.id)}>
                <ChainLogo chainId={chain.id} px="4px" />
              </BaseWrapper>
            </ButtonWrapper>
          )
        })}

        {hiddenChains.length > 0 && (
          <InlineMenu
            component={
              <ButtonWrapper style={{ marginRight: 0, width: `${CHAIN_BUTTON_WIDTH}px` }}>
                <BaseWrapper>
                  <Text color="textSubtle" bold px="6px">
                    +{hiddenChains.length}
                  </Text>
                </BaseWrapper>
              </ButtonWrapper>
            }
          >
            <Flex flexDirection="column" pt="12px" pb="4px">
              {hiddenChains.map((chain) => {
                return (
                  <ChainOption key={`buttonNetworkSelect#${chain.id}`} onClick={() => onSelect(chain.id)} pb="8px">
                    <ChainLogo chainId={chain.id} px="4px" />
                    <Text color="inherit" px="6px">
                      {chainNameConverter(chain.name)}
                    </Text>
                  </ChainOption>
                )
              })}
            </Flex>
          </InlineMenu>
        )}
      </RowWrapper>
    </AutoColumn>
  )
}
