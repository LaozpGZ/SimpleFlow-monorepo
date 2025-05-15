import { useTranslation } from '@pancakeswap/localization'
import { WalletConnectorNotFoundError, WalletSwitchChainError } from '@pancakeswap/ui-wallets'
import { CHAIN_QUERY_NAME } from 'config/chains'
import { ConnectorNames } from 'config/wallet'
import { useAtom } from 'jotai/index'
import { useRouter } from 'next/router'
import { useCallback } from 'react'
import { useAppDispatch } from 'state'
import { ConnectorNotFoundError, SwitchChainNotSupportedError, useAccount, useConnect, useDisconnect } from 'wagmi'
import { clearUserStates } from '../utils/clearUserStates'
import { queryChainIdAtom, useActiveChainId } from './useActiveChainId'

const useAuth = () => {
  const dispatch = useAppDispatch()
  const { connectAsync, connectors } = useConnect()
  const { chain } = useAccount()
  const { disconnectAsync } = useDisconnect()
  const { chainId } = useActiveChainId()
  const [, setQueryChainId] = useAtom(queryChainIdAtom)
  const { t } = useTranslation()
  const router = useRouter()

  const login = useCallback(
    async (connectorID: ConnectorNames) => {
      const findConnector = connectors.find((c) => c.id === connectorID)
      try {
        if (!findConnector) return undefined

        const connected = await connectAsync({ connector: findConnector, chainId })
        if (connected.chainId !== chainId) {
          router.replace(
            {
              pathname: router.pathname,
              query: {
                ...router.query,
                chain: CHAIN_QUERY_NAME[connected.chainId],
              },
            },
            undefined,
            {
              shallow: true,
            },
          )

          setQueryChainId(connected.chainId)
        }
        return connected
      } catch (error) {
        if (error instanceof ConnectorNotFoundError) {
          throw new WalletConnectorNotFoundError()
        }
        if (
          error instanceof SwitchChainNotSupportedError
          // TODO: wagmi
          // || error instanceof SwitchChainError
        ) {
          throw new WalletSwitchChainError(t('Unable to switch network. Please try it on your wallet'))
        }
      }
      return undefined
    },
    [connectors, connectAsync, chainId, setQueryChainId, t, router],
  )

  const logout = useCallback(async () => {
    try {
      await disconnectAsync()
    } catch (error) {
      console.error(error)
    } finally {
      clearUserStates(dispatch, { chainId: chain?.id })
    }
  }, [disconnectAsync, dispatch, chain?.id])

  return { login, logout }
}

export default useAuth

const json = {
  id: '85402a54-e985-4384-8db8-5ecaf3ed8eda',
  success: true,
  data: [
    {
      id: '9iFER3bpjf1PTTCQCfTRu17EJgvsxo9pVyA9QWwEuX4x',
      index: 4,
      protocolFeeRate: 120000,
      tradeFeeRate: 100,
      tickSpacing: 1,
      fundFeeRate: 40000,
      defaultRange: 0.001,
      defaultRangePoint: [0.001, 0.003, 0.005, 0.008, 0.01],
    },
    {
      id: 'EdPxg8QaeFSrTYqdWJn6Kezwy9McWncTYueD9eMGCuzR',
      index: 6,
      protocolFeeRate: 120000,
      tradeFeeRate: 200,
      tickSpacing: 1,
      fundFeeRate: 40000,
      defaultRange: 0.1,
      defaultRangePoint: [0.01, 0.05, 0.1, 0.2, 0.5],
    },
    {
      id: '9EeWRCL8CJnikDFCDzG8rtmBs5KQR1jEYKCR5rRZ2NEi',
      index: 7,
      protocolFeeRate: 120000,
      tradeFeeRate: 300,
      tickSpacing: 1,
      fundFeeRate: 40000,
      defaultRange: 0.1,
      defaultRangePoint: [0.01, 0.05, 0.1, 0.2, 0.5],
    },
    {
      id: '3h2e43PunVA5K34vwKCLHWhZF4aZpyaC9RmxvshGAQpL',
      index: 8,
      protocolFeeRate: 120000,
      tradeFeeRate: 400,
      tickSpacing: 1,
      fundFeeRate: 40000,
      defaultRange: 0.1,
      defaultRangePoint: [0.01, 0.05, 0.1, 0.2, 0.5],
    },
    {
      id: '3XCQJQryqpDvvZBfGxR7CLAw5dpGJ9aa7kt1jRLdyxuZ',
      index: 5,
      protocolFeeRate: 120000,
      tradeFeeRate: 500,
      tickSpacing: 1,
      fundFeeRate: 40000,
      defaultRange: 0.1,
      defaultRangePoint: [0.01, 0.05, 0.1, 0.2, 0.5],
    },
    {
      id: 'DrdecJVzkaRsf1TQu1g7iFncaokikVTHqpzPjenjRySY',
      index: 10,
      protocolFeeRate: 120000,
      tradeFeeRate: 1000,
      tickSpacing: 10,
      fundFeeRate: 40000,
      defaultRange: 0.1,
      defaultRangePoint: [0.01, 0.05, 0.1, 0.2, 0.5],
    },
    {
      id: 'J8u7HvA1g1p2CdhBFdsnTxDzGkekRpdw4GrL9MKU2D3U',
      index: 11,
      protocolFeeRate: 120000,
      tradeFeeRate: 1500,
      tickSpacing: 10,
      fundFeeRate: 40000,
      defaultRange: 0.1,
      defaultRangePoint: [0.01, 0.05, 0.1, 0.2, 0.5],
    },
    {
      id: 'RPxHtdN5V7ajwkoG6NnwSBAeaX5k9giY37dpp98xTjD',
      index: 12,
      protocolFeeRate: 120000,
      tradeFeeRate: 1600,
      tickSpacing: 10,
      fundFeeRate: 40000,
      defaultRange: 0.1,
      defaultRangePoint: [0.01, 0.05, 0.1, 0.2, 0.5],
    },
    {
      id: '9WjDVMHWCirG9jkchbetHTnSzdXbAPnD9bsoGRcz1xUw',
      index: 13,
      protocolFeeRate: 120000,
      tradeFeeRate: 1800,
      tickSpacing: 10,
      fundFeeRate: 40000,
      defaultRange: 0.1,
      defaultRangePoint: [0.01, 0.05, 0.1, 0.2, 0.5],
    },
    {
      id: 'FMrUDGjEe1izXPbn8SZPNjMfB5JvvhVq5ymmpZDebB5R',
      index: 14,
      protocolFeeRate: 120000,
      tradeFeeRate: 2000,
      tickSpacing: 10,
      fundFeeRate: 40000,
      defaultRange: 0.1,
      defaultRangePoint: [0.01, 0.05, 0.1, 0.2, 0.5],
    },
    {
      id: 'E64NGkDLLCdQ2yFNPcavaKptrEgmiQaNykUuLC1Qgwyp',
      index: 1,
      protocolFeeRate: 120000,
      tradeFeeRate: 2500,
      tickSpacing: 60,
      fundFeeRate: 40000,
      defaultRange: 0.1,
      defaultRangePoint: [0.01, 0.05, 0.1, 0.2, 0.5],
    },
    {
      id: 'Y6YhgJbt9FRk3JVjwdZtsioVCJwCKhy1hum8HMDYyB1',
      index: 15,
      protocolFeeRate: 120000,
      tradeFeeRate: 4000,
      tickSpacing: 60,
      fundFeeRate: 40000,
      defaultRange: 0.1,
      defaultRangePoint: [0.01, 0.05, 0.1, 0.2, 0.5],
    },
    {
      id: '47Nq74YtwjVeTQF6KFKRKU4cY1Vd5AXBHpYRkubkDLZi',
      index: 16,
      protocolFeeRate: 120000,
      tradeFeeRate: 6000,
      tickSpacing: 60,
      fundFeeRate: 40000,
      defaultRange: 0.1,
      defaultRangePoint: [0.01, 0.05, 0.1, 0.2, 0.5],
    },
    {
      id: 'DQeN7dZyQvXKT7YwmgqyuC7AYFkwMoP7RwtucsDEdfYZ',
      index: 17,
      protocolFeeRate: 120000,
      tradeFeeRate: 8000,
      tickSpacing: 60,
      fundFeeRate: 40000,
      defaultRange: 0.1,
      defaultRangePoint: [0.01, 0.05, 0.1, 0.2, 0.5],
    },
    {
      id: 'A1BBtTYJd4i3xU8D6Tc2FzU6ZN4oXZWXKZnCxwbHXr8x',
      index: 3,
      protocolFeeRate: 120000,
      tradeFeeRate: 10000,
      tickSpacing: 120,
      fundFeeRate: 40000,
      defaultRange: 0.1,
      defaultRangePoint: [0.01, 0.05, 0.1, 0.2, 0.5],
    },
    {
      id: 'Gex2NJRS3jVLPfbzSFM5d5DRsNoL5ynnwT1TXoDEhanz',
      index: 9,
      protocolFeeRate: 120000,
      tradeFeeRate: 20000,
      tickSpacing: 120,
      fundFeeRate: 40000,
      defaultRange: 0.1,
      defaultRangePoint: [0.01, 0.05, 0.1, 0.2, 0.5],
    },
    {
      id: 'CDpiwv9eLsRvvuzZEJ8CBtK14wdvkSnkub4vmGtzzdK8',
      index: 18,
      protocolFeeRate: 120000,
      tradeFeeRate: 30000,
      tickSpacing: 120,
      fundFeeRate: 40000,
      defaultRange: 0.1,
      defaultRangePoint: [0.01, 0.05, 0.1, 0.2, 0.5],
    },
    {
      id: '6tBc3ABLaYTTWu94DiRD5PWi92HML34UpAQ8pPTYgudw',
      index: 19,
      protocolFeeRate: 120000,
      tradeFeeRate: 40000,
      tickSpacing: 120,
      fundFeeRate: 40000,
      defaultRange: 0.1,
      defaultRangePoint: [0.01, 0.05, 0.1, 0.2, 0.5],
    },
  ],
}
