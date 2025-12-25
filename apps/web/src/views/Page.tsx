import { ChainId } from '@simpleflow/chains'
import { useTranslation } from '@simpleflow/l10n'
import { Swap } from '@simpleflow/widgets-internal'
import { EXCHANGE_HELP_URLS } from 'config/constants'
import { useActiveChainId } from 'hooks/useActiveChainId'

const Page: React.FC<
  React.PropsWithChildren<{
    removePadding?: boolean
    hideFooterOnDesktop?: boolean
    noMinHeight?: boolean
    helpUrl?: string
    showExternalLink?: boolean
    showHelpLink?: boolean
    style?: React.CSSProperties
  }>
> = ({
  children,
  removePadding = false,
  hideFooterOnDesktop = false,
  noMinHeight = false,
  helpUrl = EXCHANGE_HELP_URLS,
  showExternalLink = true,
  showHelpLink = true,
  ...props
}) => {
  const { t } = useTranslation()
  const { chainId } = useActiveChainId()
  const isBSC = chainId === ChainId.BSC
  const externalText = isBSC ? t('Bridge assets to BNB Chain') : ''
  const externalLinkUrl = isBSC ? 'https://bridge.simpleflow.finance/' : ''

  return (
    <Swap.Page
      removePadding={removePadding}
      noMinHeight={noMinHeight}
      hideFooterOnDesktop={hideFooterOnDesktop}
      helpUrl={showHelpLink ? helpUrl : undefined}
      externalText={externalText}
      externalLinkUrl={showExternalLink ? externalLinkUrl : undefined}
      {...props}
    >
      {children}
    </Swap.Page>
  )
}

export default Page

export const PageWithoutFAQ = Page
PageWithoutFAQ.defaultProps = { showHelpLink: false, showExternalLink: false }
