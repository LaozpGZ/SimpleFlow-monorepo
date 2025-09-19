import { TableView } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { useUserLimitOrders } from 'views/PCSLimitOrders/hooks/useUserLimitOrders'
import { parseOrders } from 'views/PCSLimitOrders/utils/orders'
import { CAKE } from '@pancakeswap/tokens'
import { Native, NATIVE } from '@pancakeswap/sdk'
import { OrderStatus } from 'views/PCSLimitOrders/types/orders.types'
import { OrderStatusDisplay } from './TableItems/OrderStatusDisplay'
import { TokenAmountDisplay } from './TableItems/TokenAmountDisplay'

export const OrdersTable = () => {
  const { t } = useTranslation()

  const { data } = useUserLimitOrders()

  // Parse orders to match table format
  const orders = parseOrders((data as any[]) ?? [])

  const columns = [
    {
      title: t('Sell'),
      dataIndex: 'sell',
      key: 'sell',
      render: (value) => (
        <div>
          <TokenAmountDisplay currency={CAKE[56]} amount="100000" />
        </div>
      ),
    },
    {
      title: t('Buy'),
      dataIndex: 'buy',
      key: 'buy',
      render: (value) => (
        <div>
          <TokenAmountDisplay currency={Native.onChain(56)} amount="100000" />
        </div>
      ),
    },
    {
      title: t('Limit Price'),
      dataIndex: 'limitPrice',
      key: 'limitPrice',
      render: (value) => <div>{value}</div>,
    },
    {
      title: t('Status'),
      dataIndex: 'status',
      key: 'status',
      render: (value) => (
        <div>
          <OrderStatusDisplay status={value} />
        </div>
      ),
    },
    {
      title: t('Filled'),
      dataIndex: 'filled',
      key: 'filled',
      render: (value) => <div>{value}</div>,
    },
    {
      title: t('Amount Received'),
      dataIndex: 'amountReceived',
      key: 'amountReceived',
      render: (value) => <div>{value}</div>,
    },
    {
      title: t('View Pending Only'),
      dataIndex: 'actions',
      key: 'actions',
      render: (value) => <div>{value}</div>,
    },
  ]

  // TODO: Add mobile list view

  return (
    <>
      <TableView columns={columns} data={orders as any[]} />
    </>
  )
}
