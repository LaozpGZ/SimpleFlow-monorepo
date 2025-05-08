import { ChainId } from '@pancakeswap/chains'
import { useTranslation } from '@pancakeswap/localization'
import { appearAnimation, AutoColumn, AutoRow, ChevronDownIcon, Flex, InlineMenu, Text } from '@pancakeswap/uikit'
import { ChainLogo } from '@pancakeswap/widgets-internal'
import { useActiveChainId } from 'hooks/useActiveChainId'
import drop from 'lodash/drop'
import take from 'lodash/take'
import { useMemo } from 'react'
import styled from 'styled-components'
import { chainNameConverter } from 'utils/chainNameConverter'
import { chains as evmChains } from 'utils/wagmi'
import { BaseWrapper, ButtonWrapper, RowWrapper } from './CommonBases'

const NetworkMenuColumn = styled(Flex)`
  flex-direction: column;
  overflow: hidden;

  background-color: ${({ theme }) => theme.colors.input};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: ${({ theme }) => theme.radii.card};

  animation: ${appearAnimation} 0.2s ease;
`

const NetworkSelectRow = styled(Flex)`
  cursor: pointer;
  padding: 8px 16px 8px;
  gap: 8px;
  transition: background-color 0.15s;
  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
  }
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

  const [shownChains, hiddenChains] = useMemo(() => {
    const filteredChains = evmChains.filter((chain) => {
      if (chain.id === usedChainId) return false
      if ('testnet' in chain && chain.testnet && chain.id !== ChainId.MONAD_TESTNET) {
        return showTestnet
      }
      return true
    })

    return [take(filteredChains, 4), drop(filteredChains, 4)]
  }, [usedChainId, showTestnet])

  return (
    <AutoColumn gap="sm">
      <AutoRow>
        <Text color="textSubtle" fontSize="14px">
          {t('Network')}
        </Text>
      </AutoRow>
      <RowWrapper>
        {selectedChain ? (
          <ButtonWrapper style={{ marginRight: '4px' }}>
            <BaseWrapper disable>
              <ChainLogo
                chainId={selectedChain.id}
                style={{
                  position: 'relative',
                  top: '2px',
                }}
                pl="4px"
              />
              <Text color="inherit" px="6px">
                {chainNameConverter(selectedChain.name)}
              </Text>
            </BaseWrapper>
          </ButtonWrapper>
        ) : null}

        {shownChains.map((chain) => {
          return (
            <ButtonWrapper key={`buttonNetworkSelect#${chain.id}`} style={{ marginRight: '4px' }}>
              <BaseWrapper onClick={() => onSelect(chain.id)}>
                <ChainLogo chainId={chain.id} px="4px" />
              </BaseWrapper>
            </ButtonWrapper>
          )
        })}

        <InlineMenu
          component={
            <ButtonWrapper>
              <BaseWrapper>
                <Text color="textSubtle" bold px="6px">
                  +{hiddenChains.length}
                </Text>
                <ChevronDownIcon color="textSubtle" ml="-4px" />
              </BaseWrapper>
            </ButtonWrapper>
          }
        >
          <NetworkMenuColumn>
            {hiddenChains.map((chain) => {
              return (
                <NetworkSelectRow key={`buttonNetworkSelect#${chain.id}`} onClick={() => onSelect(chain.id)}>
                  <ChainLogo chainId={chain.id} />
                  <Text color="inherit">{chainNameConverter(chain.name)}</Text>
                </NetworkSelectRow>
              )
            })}
          </NetworkMenuColumn>
        </InlineMenu>
      </RowWrapper>
    </AutoColumn>
  )
}
