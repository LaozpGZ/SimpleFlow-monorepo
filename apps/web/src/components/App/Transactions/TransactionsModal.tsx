import { useTranslation } from '@pancakeswap/localization'
import { Box, Button, FlexGap, InjectedModalProps, Modal, ModalBody, SwapLoading, Text } from '@pancakeswap/uikit'
import { TransactionList } from '@pancakeswap/widgets-internal'
import isEmpty from 'lodash/isEmpty'
import { useCallback, useMemo } from 'react'
import { useAppDispatch } from 'state'
import { useAllSortedRecentTransactions } from 'state/transactions/hooks'
import { useRecentXOrders } from 'views/Swap/x/useRecentXOders'

import { clearAllTransactions } from 'state/transactions/actions'
import { useRecentBridgeOrders } from 'views/Swap/Bridge/hooks/useRecentBridgeOrders'
import { useAccount } from 'wagmi'
import { usePrivyWalletAddress } from 'contexts/Privy/hooks'

import ConnectWalletButton from '../../ConnectWalletButton'
import { AutoRow } from '../../Layout/Row'
import { CrossChainTransaction } from './CrossChainTransaction'
import Transaction from './Transaction'
import { XTransaction } from './XTransaction'
import { AmmTransactionItem, CrossChainTransactionItem, TransactionItem, XTransactionItem } from './types'

function getTransactionTimestamp(item: TransactionItem): number {
  switch (item.type) {
    case 'tx':
      return item.item.addedTime
    case 'xOrder':
      return new Date(item.item.createdAt).getTime()
    case 'crossChainOrder':
      return new Date(item.order.timestamp).getTime()
    default:
      return 0
  }
}

function sortByTransactionTime(a: TransactionItem, b: TransactionItem) {
  const timeA = getTransactionTimestamp(a)
  const timeB = getTransactionTimestamp(b)
  return timeB - timeA
}

export function RecentTransactions() {
  const { address: wagmiAddress, chainId } = useAccount()
  const { address: finalAddress, addressType, hasSmartWallet } = usePrivyWalletAddress()
  const dispatch = useAppDispatch()

  console.log('🔍 TransactionsModal Debug Info:', {
    wagmiAddress,
    finalAddress,
    addressType,
    hasSmartWallet,
    chainId,
  })

  const { data: recentXOrders } = useRecentXOrders({
    chainId,
    address: finalAddress,
    refetchInterval: 10_000,
  })

  // Cross-Chain Orders
  const {
    data: crossChainOrdersResponse,
    isFetching: isRecentBridgeOrdersLoading,
    fetchNextPage,
  } = useRecentBridgeOrders({
    address: finalAddress,
  })

  console.log('🌉 Cross Chain Orders Debug:', {
    address: finalAddress,
    crossChainOrdersResponse,
    isLoading: isRecentBridgeOrdersLoading,
    hasData: !!crossChainOrdersResponse?.pages?.length,
    totalOrders: crossChainOrdersResponse?.pages?.reduce((total, page) => total + (page?.rows?.length || 0), 0) || 0,
  })

  const hasMoreCrossChainOrders = Boolean(
    crossChainOrdersResponse?.pages[crossChainOrdersResponse.pages.length - 1].hasNextPage,
  )

  const recentCrossChainOrders: CrossChainTransactionItem[] =
    crossChainOrdersResponse?.pages.flatMap(
      (page) =>
        page?.rows?.map(
          (order): CrossChainTransactionItem => ({
            type: 'crossChainOrder',
            order,
          }),
        ) ?? [],
    ) ?? []

  console.log('📋 Processed Cross Chain Orders:', {
    count: recentCrossChainOrders.length,
    orders: recentCrossChainOrders.map((item) => ({
      orderId: item.order.orderId,
      timestamp: item.order.timestamp,
      status: item.order.status,
      inputToken: item.order.inputToken,
      outputToken: item.order.outputToken,
    })),
  })

  const sortedRecentTransactions = useAllSortedRecentTransactions()
  const ammTransactions: AmmTransactionItem[] = useMemo(
    () =>
      Object.entries(sortedRecentTransactions).flatMap(([chainId, transactions]) => {
        return Object.values(transactions).map((transaction) => ({
          type: 'tx',
          item: transaction,
          chainId: Number(chainId),
        }))
      }),
    [sortedRecentTransactions],
  )

  console.log('💸 Regular AMM Transactions:', {
    count: ammTransactions.length,
    transactions: ammTransactions.map((tx) => ({
      hash: tx.item.hash,
      from: tx.item.from,
      addedTime: tx.item.addedTime,
      chainId: tx.chainId,
    })),
  })

  const xOrders: XTransactionItem[] = useMemo(
    () => recentXOrders?.orders.reverse().map((order) => ({ type: 'xOrder', item: order })) ?? [],
    [recentXOrders],
  )

  console.log('🔄 X Orders:', {
    count: xOrders.length,
    orders: xOrders.map((x) => ({
      hash: x.item.hash,
      createdAt: x.item.createdAt,
    })),
  })

  console.log('📊 Final Transaction Summary:', {
    ammTransactions: ammTransactions.length,
    xOrders: xOrders.length,
    crossChainOrders: recentCrossChainOrders.length,
    totalDisplayed: ammTransactions.length + xOrders.length + recentCrossChainOrders.length,
    hasTransactions,
    showingTransactions: xOrders.length > 0 || hasTransactions || recentCrossChainOrders.length > 0,
  })

  const { t } = useTranslation()

  const hasTransactions = !isEmpty(sortedRecentTransactions)

  const clearAllTransactionsCallback = useCallback(() => {
    dispatch(clearAllTransactions())
  }, [dispatch])

  const recentTransactionsHeading = useMemo(() => {
    return (
      <FlexGap alignItems="center" gap="8px">
        <Text color="secondary" fontSize="12px" textTransform="uppercase" bold>
          {t('Recent Transactions')}
        </Text>
        {isRecentBridgeOrdersLoading && <SwapLoading />}
      </FlexGap>
    )
  }, [t, isRecentBridgeOrdersLoading])

  return (
    <Box onClick={(e) => e.stopPropagation()}>
      {finalAddress ? (
        xOrders.length > 0 || hasTransactions || recentCrossChainOrders.length > 0 ? (
          <>
            <AutoRow mb="1rem" style={{ justifyContent: 'space-between' }}>
              {recentTransactionsHeading}
              {hasTransactions && (
                <Button variant="tertiary" scale="xs" onClick={clearAllTransactionsCallback}>
                  {t('clear')}
                </Button>
              )}
            </AutoRow>

            <UnifiedTransactionList
              transactions={ammTransactions}
              xOrders={xOrders}
              crossChainOrders={recentCrossChainOrders}
            />

            {hasMoreCrossChainOrders && (
              <Button
                variant="text"
                scale="sm"
                mt="16px"
                disabled={isRecentBridgeOrdersLoading}
                onClick={() => fetchNextPage()}
              >
                {isRecentBridgeOrdersLoading ? t('Loading...') : t('Load More')}
              </Button>
            )}
          </>
        ) : (
          <>
            {recentTransactionsHeading}
            <Text mt="8px">{t('No recent transactions')}</Text>
          </>
        )
      ) : (
        <ConnectWalletButton />
      )}
    </Box>
  )
}

const TransactionsModal: React.FC<React.PropsWithChildren<InjectedModalProps>> = ({ onDismiss }) => {
  const { t } = useTranslation()

  return (
    <Modal title={t('Recent Transactions')} headerBackground="gradientCardHeader" onDismiss={onDismiss}>
      <ModalBody>
        <RecentTransactions />
      </ModalBody>
    </Modal>
  )
}

function UnifiedTransactionList({
  transactions,
  xOrders = [],
  crossChainOrders = [],
}: {
  transactions?: TransactionItem[]
  xOrders?: TransactionItem[]
  crossChainOrders?: TransactionItem[]
}) {
  const allTransactionItems = useMemo(
    () => [...(transactions || []), ...crossChainOrders, ...xOrders].sort(sortByTransactionTime),
    [transactions, xOrders, crossChainOrders],
  )

  return (
    <TransactionList>
      {allTransactionItems.map((tx) => {
        if (tx.type === 'tx') {
          return <Transaction key={tx.item.hash + tx.item.addedTime} tx={tx.item} chainId={tx.chainId} />
        }
        if (tx.type === 'crossChainOrder') {
          return <CrossChainTransaction key={tx.order.orderId} order={tx.order} />
        }
        return <XTransaction key={tx.item.hash} order={tx.item} />
      })}
    </TransactionList>
  )
}

export default TransactionsModal
