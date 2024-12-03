import { Button, ButtonProps } from '@pancakeswap/uikit'
import { useSwitchNetworkLoading } from 'hooks/useSwitchNetworkLoading'
import { useActiveChainId } from 'hooks/useActiveChainId'
import Trans from './Trans'

const wrongNetworkProps: ButtonProps = {
  variant: 'danger',
  disabled: false,
  children: <Trans>Wrong Network</Trans>,
}

export const CommitButton = (props: ButtonProps) => {
  const { isWrongNetwork } = useActiveChainId()
  const [switchNetworkLoading] = useSwitchNetworkLoading()

  return (
    <Button
      {...props}
      onClick={(e) => {
        if (!isWrongNetwork) {
          props.onClick?.(e)
        }
      }}
      {...(switchNetworkLoading && { disabled: true })}
      {...(isWrongNetwork && wrongNetworkProps)}
    />
  )
}
