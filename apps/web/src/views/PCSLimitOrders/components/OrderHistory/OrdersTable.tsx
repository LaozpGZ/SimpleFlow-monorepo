import { TableView } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { useUserLimitOrders } from 'views/PCSLimitOrders/hooks/useUserLimitOrders'
import { parseOrders } from 'views/PCSLimitOrders/utils/orders'
import { CAKE } from '@pancakeswap/tokens'
import { Native } from '@pancakeswap/sdk'
import { OrderStatusDisplay } from './TableItems/OrderStatusDisplay'
import { TokenAmountDisplay } from './TableItems/TokenAmountDisplay'

export const OrdersTable = () => {
  const { t } = useTranslation()

  const { data } = useUserLimitOrders()

  const columns = [
    {
      title: t('Sell'),
      dataIndex: 'sell',
      key: 'sell',
      render: (value) => (
        <div>
          <TokenAmountDisplay currency={CAKE[56]} amount={value} />
        </div>
      ),
    },
    {
      title: t('Buy'),
      dataIndex: 'buy',
      key: 'buy',
      render: (value) => (
        <div>
          <TokenAmountDisplay currency={Native.onChain(56)} amount={value} />
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
      <TableView columns={columns} data={data as any[]} getRowKey={(record) => record.order_id} />
      {/* pagination support here for desktop. For mobile, infinite scroll when element interacts */}
    </>
  )
}
