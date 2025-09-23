import { FlexGap, IconButton, SwapHorizIcon, Table, Td, Text } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { useUserLimitOrders } from 'views/PCSLimitOrders/hooks/useUserLimitOrders'
import { CAKE } from '@pancakeswap/tokens'
import { Native } from '@pancakeswap/sdk'
import { ResponseOrder } from 'views/PCSLimitOrders/types/orders.types'
import { useOrder } from 'views/PCSLimitOrders/hooks/useOrder'
import styled from 'styled-components'
import { OrderStatusDisplay } from './TableItems/OrderStatusDisplay'
import { TokenAmountDisplay } from './TableItems/TokenAmountDisplay'

const Thead = styled.thead`
  border-top: 1px solid ${({ theme }) => theme.colors.cardBorder};
`

const Th = styled.th`
  color: ${({ theme }) => theme.colors.secondary};
  font-size: 12px;
  text-transform: uppercase;
  white-space: nowrap;
  font-weight: 600 !important;
  text-align: left;
  padding: 16px;
`

const Tr = styled.tr`
  border-top: 1px solid ${({ theme }) => theme.colors.cardBorder};
`

interface OrderTableRowProps {
  order: ResponseOrder
}
const OrderTableRow = ({ order }: OrderTableRowProps) => {
  const { currencyA, currencyB, limitPrice, isInverted, setIsInverted, amountAReceived, amountBReceived } =
    useOrder(order)

  return (
    <Tr>
      <Td>{currencyA && <TokenAmountDisplay currency={currencyA} amount="0" />}</Td>
      <Td>{currencyB && <TokenAmountDisplay currency={currencyB} amount="0" />}</Td>
      <Td>
        <FlexGap alignItems="center" gap="4px">
          <Text small bold>
            1 {isInverted ? currencyB?.symbol : currencyA?.symbol}{' '}
          </Text>
          <IconButton onClick={() => setIsInverted(!isInverted)} variant="text" scale="xs">
            <SwapHorizIcon width="18px" height="18px" color="primary60" />
          </IconButton>{' '}
          <Text small bold>
            {limitPrice || '-'} {isInverted ? currencyA?.symbol : currencyB?.symbol}
          </Text>
        </FlexGap>
      </Td>
      <Td>
        <OrderStatusDisplay status={order.status} />
      </Td>
      <Td>-</Td>
      <Td>
        {currencyA && <TokenAmountDisplay currency={currencyA} amount={amountAReceived ?? '-'} />}
        {currencyB && <TokenAmountDisplay currency={currencyB} amount={amountBReceived ?? '-'} />}
      </Td>
      <Td>-</Td>
    </Tr>
  )
}

export const OrdersTable = () => {
  const { t } = useTranslation()

  const { data } = useUserLimitOrders()

  // const columns = [
  //   {
  //     title: t('Sell'),
  //     dataIndex: 'sell',
  //     key: 'sell',
  //     render: (value) => (
  //       <div>
  //         <TokenAmountDisplay currency={value?.order?.data.zeroForOne ? token0 : token1} amount={value.value} />
  //       </div>
  //     ),
  //   },
  //   {
  //     title: t('Buy'),
  //     dataIndex: 'buy',
  //     key: 'buy',
  //     render: (value) => (
  //       <div>
  //         <TokenAmountDisplay currency={value?.order?.data.zeroForOne ? token1 : token0} amount={value.value} />
  //       </div>
  //     ),
  //   },
  //   {
  //     title: t('Limit Price'),
  //     dataIndex: 'limitPrice',
  //     key: 'limitPrice',
  //     render: (value) => <div>{value}</div>,
  //   },
  //   {
  //     title: t('Status'),
  //     dataIndex: 'status',
  //     key: 'status',
  //     render: (value) => (
  //       <div>
  //         <OrderStatusDisplay status={value} />
  //       </div>
  //     ),
  //   },
  //   {
  //     title: t('Filled'),
  //     dataIndex: 'filled',
  //     key: 'filled',
  //     render: (value) => <div>{value}</div>,
  //   },
  //   {
  //     title: t('Amount Received'),
  //     dataIndex: 'amountReceived',
  //     key: 'amountReceived',
  //     render: (value) => (
  //       <AutoColumn>
  //         <TokenAmountDisplay
  //           currency={value?.order?.data.zeroForOne ? token0 : token1}
  //           amount={formatUnits(
  //             value.amount0Received ?? '0',
  //             (value?.order?.data.zeroForOne ? token0.decimals : token1.decimals) ?? 18,
  //           )}
  //         />
  //         <TokenAmountDisplay
  //           currency={value?.order?.data.zeroForOne ? token1 : token0}
  //           amount={formatUnits(
  //             value.amount1Received ?? '0',
  //             (value?.order?.data.zeroForOne ? token1.decimals : token0.decimals) ?? 18,
  //           )}
  //         />
  //       </AutoColumn>
  //     ),
  //   },
  //   {
  //     // title: t('View Pending Only'),
  //     title: '',
  //     dataIndex: 'actions',
  //     key: 'actions',
  //     render: (value) => <div>{value}</div>,
  //   },
  // ]

  // TODO: Add mobile list view

  return (
    <>
      <Table>
        <Thead>
          <tr>
            <Th>{t('Sell')}</Th>
            <Th>{t('Buy')}</Th>
            <Th>{t('Limit Price')}</Th>
            <Th>{t('Status')}</Th>
            <Th>{t('Filled')}</Th>
            <Th>{t('Amount Received')}</Th>
            <Th>-</Th>
          </tr>
        </Thead>
        <tbody>
          {data?.map((order) => (
            <OrderTableRow key={order.order_id} order={order} />
          ))}
        </tbody>
      </Table>
      {/* <TableView columns={columns} data={data as any[]} getRowKey={(record) => record.order_id} /> */}
      {/* pagination support here for desktop. For mobile, infinite scroll when element interacts */}
    </>
  )
}
