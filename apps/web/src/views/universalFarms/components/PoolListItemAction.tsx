import { useTheme } from '@simpleflow/hooks'
import { useTranslation } from '@simpleflow/l10n'
import { Button, Flex, MoreIcon, SubMenu } from '@simpleflow/uikit'
import { NextLinkFromReactRouter } from '@simpleflow/widgets-internal'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { memo, useCallback, useMemo } from 'react'
import type { PoolInfo } from 'state/farmsV4/state/type'
import styled, { css } from 'styled-components'
import { getPoolAddLiquidityLink } from 'utils/getPoolLink'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { isEvm } from '@simpleflow/chains'

const BaseButtonStyle = css`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 400;
  padding: 8px 16px;
  line-height: 24px;
  height: auto;
  justify-content: flex-start;
`
const StyledButton = styled(Button)`
  ${BaseButtonStyle}
`

const StyledConnectWalletButton = styled(ConnectWalletButton)`
  ${BaseButtonStyle}
`

export const PoolListItemAction = memo(({ pool }: { pool: PoolInfo }) => {
  const { theme } = useTheme()

  return (
    <SubMenu
      style={{
        background: theme.card.background,
        borderColor: theme.colors.cardBorder,
      }}
      component={
        <Button scale="xs" variant="text">
          <MoreIcon />
        </Button>
      }
    >
      <ActionItems pool={pool} />
    </SubMenu>
  )
})

export const ActionItems = ({ pool, icon }: { pool: PoolInfo; icon?: React.ReactNode }) => {
  const { t } = useTranslation()
  const { account, solanaAccount } = useAccountActiveChain()

  const addLiquidityLink = useMemo(() => getPoolAddLiquidityLink(pool), [pool])

  const stopBubble = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
  }, [])

  const connected = Boolean(isEvm(pool.chainId) ? account : solanaAccount)

  return (
    <Flex flexDirection="column" onClick={stopBubble}>
      {!connected ? (
        <StyledConnectWalletButton scale="sm" variant="text" />
      ) : (
        <NextLinkFromReactRouter to={addLiquidityLink}>
          <StyledButton scale="sm" variant="text">
            {t('Add Liquidity')}
            {icon}
          </StyledButton>
        </NextLinkFromReactRouter>
      )}
    </Flex>
  )
}
