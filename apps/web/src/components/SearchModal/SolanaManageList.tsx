import { useTranslation } from '@pancakeswap/localization'
import { TokenList } from '@pancakeswap/token-lists'
import { disableList, enableList } from '@pancakeswap/token-lists/react'
import { AutoColumn, Column, Text, Toggle } from '@pancakeswap/uikit'
import { ListLogo } from '@pancakeswap/widgets-internal'

import { useAtomValue } from 'jotai'
import { memo, useCallback } from 'react'
import { useListState } from 'state/lists/lists'

import { selectorByUrlsAtom } from '../../state/lists/hooks'

import Row, { RowFixed } from '../Layout/Row'
import { CurrencyModalView } from './types'
import { ListContainer, RowWrapper, Wrapper } from './ManageLists'

const SolanaListRow = memo(function SolanaListRow({ listUrl }: { listUrl: string }) {
  const { t } = useTranslation()
  // TODO: add useIsListActiveBySolana
  //   const isActive = useIsListActiveByChainId(listUrl, chainId)
  const isActive = false

  const listsByUrl = useAtomValue(selectorByUrlsAtom)
  const [, dispatch] = useListState()
  const { current: list, pendingUpdate: pending } = listsByUrl[listUrl]

  const handleEnableList = useCallback(() => {
    dispatch(enableList(listUrl))
  }, [dispatch, listUrl])

  const handleDisableList = useCallback(() => {
    dispatch(disableList(listUrl))
  }, [dispatch, listUrl])

  if (!list) return null

  const logoURI = ''

  return (
    <RowWrapper
      active={isActive}
      hasActiveTokens={false}
      key={listUrl}
      id={`solana-list-row-${listUrl.replace(/\./g, '-')}`}
    >
      {logoURI ? (
        <ListLogo size="40px" style={{ marginRight: '1rem' }} logoURI={logoURI} alt={`${list.name} list logo`} />
      ) : (
        <div style={{ width: '24px', height: '24px', marginRight: '1rem' }} />
      )}
      <Column style={{ flex: '1' }}>
        <Row>
          <Text bold>{list.name}</Text>
        </Row>
        <RowFixed mt="4px">
          <Text fontSize="12px" mr="6px" textTransform="lowercase">
            {list.tokens.length} {t('Tokens')}
          </Text>
        </RowFixed>
      </Column>
      <Toggle
        checked={isActive}
        onChange={() => {
          if (isActive) {
            handleDisableList()
          } else {
            handleEnableList()
          }
        }}
      />
    </RowWrapper>
  )
})

const sortedLists = []

function SolanaManageList({
  setModalView,
  setImportList,
  setListUrl,
}: {
  setModalView: (view: CurrencyModalView) => void
  setImportList: (list: TokenList) => void
  setListUrl: (url: string) => void
}) {
  return (
    <Wrapper>
      <h1>Solana</h1>
      <ListContainer>
        <AutoColumn gap="md">
          {sortedLists.map((listUrl) => (
            <SolanaListRow key={listUrl} listUrl={listUrl} />
          ))}
        </AutoColumn>
      </ListContainer>
    </Wrapper>
  )
}

export default SolanaManageList
