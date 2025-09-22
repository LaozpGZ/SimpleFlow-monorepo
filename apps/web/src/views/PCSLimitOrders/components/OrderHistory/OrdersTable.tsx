import { AutoColumn, TableView } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { useUserLimitOrders } from 'views/PCSLimitOrders/hooks/useUserLimitOrders'
import { parseOrders } from 'views/PCSLimitOrders/utils/orders'
import { CAKE } from '@pancakeswap/tokens'
import { Currency, Native, ZERO_ADDRESS } from '@pancakeswap/sdk'
import { useRef } from 'react'
import { useAtomValue } from 'jotai'
import { useCurrency, useToken, useTokenByChainId } from 'hooks/Tokens'
import { formatUnits } from '@pancakeswap/utils/viem/formatUnits'
import { TokenAmountDisplay } from './TableItems/TokenAmountDisplay'
import { OrderStatusDisplay } from './TableItems/OrderStatusDisplay'

export const OrdersTable = () => {
  const { t } = useTranslation()

  const { data } = useUserLimitOrders()

  const token0 = Native.onChain(56)
  const token1 = CAKE[56]

  const columns = [
    {
      title: t('Sell'),
      dataIndex: 'sell',
      key: 'sell',
      render: (value) => (
        <div>
          <TokenAmountDisplay currency={value?.order?.data.zeroForOne ? token0 : token1} amount={value.value} />
        </div>
      ),
    },
    {
      title: t('Buy'),
      dataIndex: 'buy',
      key: 'buy',
      render: (value) => (
        <div>
          <TokenAmountDisplay currency={value?.order?.data.zeroForOne ? token1 : token0} amount={value.value} />
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
      render: (value) => (
        <AutoColumn>
          <TokenAmountDisplay
            currency={value?.order?.data.zeroForOne ? token0 : token1}
            amount={formatUnits(
              value.amount0Received ?? '0',
              (value?.order?.data.zeroForOne ? token0.decimals : token1.decimals) ?? 18,
            )}
          />
          <TokenAmountDisplay
            currency={value?.order?.data.zeroForOne ? token1 : token0}
            amount={formatUnits(
              value.amount1Received ?? '0',
              (value?.order?.data.zeroForOne ? token1.decimals : token0.decimals) ?? 18,
            )}
          />
        </AutoColumn>
      ),
    },
    {
      // title: t('View Pending Only'),
      title: '',
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
