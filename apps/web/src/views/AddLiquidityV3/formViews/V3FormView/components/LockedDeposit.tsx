import { Trans } from '@simpleflow/l10n'
import { AutoColumn, LockIcon, Text } from '@simpleflow/uikit'
import { DisableCard } from 'components/Card'

export default function LockedDeposit({ children, locked, ...rest }) {
  return locked ? (
    <DisableCard {...rest}>
      <AutoColumn justify="center" gap="8px">
        <LockIcon width="24px" height="24px" color="textDisabled" />
        <Text bold color="textDisabled" textAlign="center">
          <Trans>The market price is outside your specified price range. Single-asset deposit only.</Trans>
        </Text>
      </AutoColumn>
    </DisableCard>
  ) : (
    children
  )
}
