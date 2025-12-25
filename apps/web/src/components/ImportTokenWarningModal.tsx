import { useTranslation } from '@simpleflow/l10n'
import { Token } from '@simpleflow/sdk'
import { Box, InjectedModalProps, Modal } from '@simpleflow/uikit'
import ImportToken from 'components/SearchModal/ImportToken'
import { useUnsupportedTokens } from 'hooks/Tokens'
import { useMemo } from 'react'
import { UnsupportedModal } from './UnsupportedModal'

interface Props extends InjectedModalProps {
  tokens: Token[]
  onCancel: () => void
}

const ImportTokenWarningModal: React.FC<React.PropsWithChildren<Props>> = ({ tokens, onDismiss, onCancel }) => {
  const { t } = useTranslation()

  const unsupportedTokens = useUnsupportedTokens()

  const hasUnsupportedTokens = useMemo(() => {
    return tokens.some((token) => {
      return unsupportedTokens?.[token.address]
    })
  }, [tokens, unsupportedTokens])

  if (hasUnsupportedTokens) {
    return <UnsupportedModal onDismiss={onCancel} currencies={tokens} />
  }

  return (
    <Modal
      title={t('Import Token')}
      onDismiss={() => {
        onDismiss?.()
        onCancel()
      }}
    >
      <Box maxWidth="380px">
        <ImportToken tokens={tokens} handleCurrencySelect={onDismiss} />
      </Box>
    </Modal>
  )
}

export default ImportTokenWarningModal
