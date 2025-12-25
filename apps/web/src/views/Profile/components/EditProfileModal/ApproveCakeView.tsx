import { useTranslation } from '@simpleflow/l10n'
import { AutoRenewIcon, Button, Flex, InjectedModalProps, Text } from '@simpleflow/uikit'
import { formatBigInt } from '@simpleflow/utils/formatBalance'
import useCatchTxError from 'hooks/useCatchTxError'
import { useCake } from 'hooks/useContract'
import { useProfile } from 'state/profile/hooks'
import { getPancakeProfileAddress } from 'utils/addressHelpers'
import useGetProfileCosts from 'views/Profile/hooks/useGetProfileCosts'
import { useAccount } from 'wagmi'
import { UseEditProfileResponse } from './reducer'

interface ApproveSDXPageProps extends InjectedModalProps {
  goToChange: UseEditProfileResponse['goToChange']
}

const ApproveSDXPage: React.FC<React.PropsWithChildren<ApproveSDXPageProps>> = ({ goToChange, onDismiss }) => {
  const { profile } = useProfile()
  const { t } = useTranslation()
  const { address: account, chain } = useAccount()
  const { fetchWithCatchTxError, loading: isApproving } = useCatchTxError()
  const {
    costs: { numberCakeToUpdate, numberCakeToReactivate },
  } = useGetProfileCosts()
  const cakeContract = useCake()

  if (!profile) {
    return null
  }

  const cost = profile.isActive ? numberCakeToUpdate : numberCakeToReactivate

  const handleApprove = async () => {
    if (!account || !cakeContract) return

    const receipt = await fetchWithCatchTxError(() => {
      return cakeContract.write.approve([getPancakeProfileAddress(), cost * 2n], {
        account,
        chain,
      })
    })
    if (receipt?.status) {
      goToChange()
    }
  }

  return (
    <Flex flexDirection="column">
      <Flex alignItems="center" justifyContent="space-between" mb="24px">
        <Text>{profile.isActive ? t('Cost to update:') : t('Cost to reactivate:')}</Text>
        <Text>{formatBigInt(cost)} CAKE</Text>
      </Flex>
      <Button
        disabled={isApproving}
        isLoading={isApproving}
        endIcon={isApproving ? <AutoRenewIcon spin color="currentColor" /> : null}
        width="100%"
        mb="8px"
        onClick={handleApprove}
      >
        {t('Enable.Approval')}
      </Button>
      <Button variant="text" width="100%" onClick={onDismiss} disabled={isApproving}>
        {t('Close Window')}
      </Button>
    </Flex>
  )
}

export default ApproveSDXPage
