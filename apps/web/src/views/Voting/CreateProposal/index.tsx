import { useTranslation } from '@pancakeswap/localization'
import {
  AutoRenewIcon,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  Input,
  ReactMarkdown,
  ScanLink,
  Spinner,
  Text,
  useModal,
  useToast,
} from '@pancakeswap/uikit'
import truncateHash from '@pancakeswap/utils/truncateHash'
import snapshot from '@snapshot-labs/snapshot.js'
import ConnectWalletButton from 'components/ConnectWalletButton'
import Container from 'components/Layout/Container'
import { useAtomValue } from 'jotai'
import isEmpty from 'lodash/isEmpty'
import times from 'lodash/times'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { ChangeEvent, FormEvent, Suspense, useEffect, useMemo, useState } from 'react'
import { useInitialBlock } from 'state/block/hooks'
import { ProposalTypeName } from 'state/types'
import styled from 'styled-components'
import { getBlockExploreLink } from 'utils'
import { DatePicker, DatePickerPortal, TimePicker } from 'views/Voting/components/DatePicker'
import { useAccount, useWalletClient } from 'wagmi'
import { spaceAtom } from '../atom/spaceAtom'
import Layout from '../components/Layout'
import VoteDetailsModal from '../components/VoteDetailsModal'
import { ADMINS, PANCAKE_SPACE, VOTE_THRESHOLD } from '../config'
import Choices, { ChoiceIdValue, MINIMUM_CHOICES, makeChoice } from './Choices'
import { combineDateAndTime, getFormErrors } from './helpers'
import { FormErrors, Label, SecondaryLabel } from './styles'
import { FormState } from './types'

const hub = 'https://hub.snapshot.org'
const client = new snapshot.Client712(hub)

const EasyMde = dynamic(() => import('components/EasyMde'), {
  ssr: false,
})

const CreateProposal = () => {
  const { t } = useTranslation()
  const space = useAtomValue(spaceAtom)

  const { delay, period } = space?.voting || {}
  const created = Math.floor(Date.now() / 1000)

  const [state, setState] = useState<FormState>(() => ({
    name: '',
    body: '',
    choices: times(MINIMUM_CHOICES).map(makeChoice),
    startDate: delay ? new Date(Date.now() + delay * 1000) : null,
    startTime: delay ? new Date(Date.now() + delay * 1000) : null,
    endDate: delay && period ? new Date(Date.now() + delay * 1000 + period * 1000) : null,
    endTime: delay && period ? new Date(Date.now() + delay * 1000 + period * 1000) : null,
    snapshot: 0,
  }))
  const [isLoading, setIsLoading] = useState(false)
  const [fieldsState, setFieldsState] = useState<{ [key: string]: boolean }>({})
  const { address: account } = useAccount()
  const initialBlock = useInitialBlock()
  const { push } = useRouter()
  const { toastSuccess, toastError } = useToast()
  const [onPresentVoteDetailsModal] = useModal(<VoteDetailsModal block={state.snapshot} />)
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const { name, body, choices, startDate, startTime, endDate, endTime, snapshot } = state
  const formErrors = getFormErrors(state, t)

  const { data: signer } = useWalletClient()

  const handleSubmit = async (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault()

    if (!account) return

    try {
      setIsLoading(true)

      const web3 = {
        getSigner: () => {
          return {
            _signTypedData: (domain, types, message) =>
              signer?.signTypedData({
                account,
                domain,
                types,
                message,
                primaryType: 'Proposal',
              }),
          }
        },
      }

      const start = delay ? created + delay : combineDateAndTime(startDate, startTime) || 0
      const end = period ? start + period : combineDateAndTime(endDate, endTime) || 0
      const data: any = await client.proposal(web3 as any, account, {
        space: PANCAKE_SPACE,
        type: ProposalTypeName.SINGLE_CHOICE, // TODO
        title: name,
        body,
        timestamp: created,
        start,
        end,
        choices: choices
          .filter((choice) => choice.value)
          .map((choice) => {
            return choice.value
          }),
        snapshot,
        discussion: '',
        plugins: JSON.stringify({}),
        app: 'snapshot',
      })

      // Redirect user to newly created proposal page
      push(`/voting/proposal/${data.id}`)
      toastSuccess(t('Proposal created!'))
    } catch (error) {
      toastError(t('Error'), (error as Error)?.message)
      console.error(error)
      setIsLoading(false)
    }
  }

  const updateValue = (key: string, value: string | ChoiceIdValue[] | Date) => {
    setState((prevState) => ({
      ...prevState,
      [key]: value,
    }))

    // Keep track of what fields the user has attempted to edit
    setFieldsState((prevFieldsState) => ({
      ...prevFieldsState,
      [key]: true,
    }))
  }

  const handleChange = (evt: ChangeEvent<HTMLInputElement>) => {
    const { name: inputName, value } = evt.currentTarget
    updateValue(inputName, value)
  }

  const handleEasyMdeChange = (value: string) => {
    updateValue('body', value)
  }

  const handleChoiceChange = (newChoices: ChoiceIdValue[]) => {
    updateValue('choices', newChoices)
  }

  const handleDateChange = (key: string) => (value: Date) => {
    updateValue(key, value)
  }

  const options = useMemo(() => {
    return {
      hideIcons:
        account && ADMINS.includes(account.toLowerCase())
          ? []
          : ['guide', 'fullscreen', 'preview', 'side-by-side', 'image'],
    }
  }, [account])

  useEffect(() => {
    if (initialBlock > 0) {
      setState((prevState) => ({
        ...prevState,
        snapshot: Number(initialBlock),
      }))
    }
  }, [initialBlock, setState])

  if (!space) {
    return <Box>{t('Network unstable. Please refresh to continue.')}</Box>
  }

  return (
    <Container py="40px">
      <Box mb="48px">
        <Breadcrumbs>
          <Link href="/">{t('Home')}</Link>
          <Link href="/voting">{t('Voting')}</Link>
          <Text>{t('Make a Proposal')}</Text>
        </Breadcrumbs>
      </Box>
      <form onSubmit={handleSubmit}>
        <Layout>
          <Box>
            <Box mb="24px">
              <Label htmlFor="name">{t('Title')}</Label>
              <Input id="name" name="name" value={name} scale="lg" onChange={handleChange} required />
              {formErrors.name && fieldsState.name && <FormErrors errors={formErrors.name} />}
            </Box>
            <Box mb="24px">
              <Label htmlFor="body">{t('Content')}</Label>
              <Text color="textSubtle" mb="8px">
                {t('Tip: write in Markdown!')}
              </Text>
              <EasyMde
                id="body"
                name="body"
                onTextChange={handleEasyMdeChange}
                value={body}
                options={options}
                required
              />
              {formErrors.body && fieldsState.body && <FormErrors errors={formErrors.body} />}
            </Box>
            {body && (
              <Box mb="24px">
                <Card>
                  <CardHeader>
                    <Heading as="h3" scale="md">
                      {t('Preview')}
                    </Heading>
                  </CardHeader>
                  <CardBody p="0" px="24px">
                    <ReactMarkdown>{body}</ReactMarkdown>
                  </CardBody>
                </Card>
              </Box>
            )}
            <Choices choices={choices} onChange={handleChoiceChange} />
            {formErrors.choices && fieldsState.choices && <FormErrors errors={formErrors.choices} />}
          </Box>
          <Box>
            <Card>
              <CardHeader>
                <Heading as="h3" scale="md">
                  {t('Actions')}
                </Heading>
              </CardHeader>
              <CardBody>
                <Box mb="24px">
                  <SecondaryLabel>{t('Start Date')}</SecondaryLabel>
                  <DatePicker
                    disabled={Boolean(delay)}
                    name="startDate"
                    onChange={handleDateChange('startDate')}
                    selected={startDate}
                    placeholderText="YYYY/MM/DD"
                  />
                  {formErrors.startDate && fieldsState.startDate && <FormErrors errors={formErrors.startDate} />}
                </Box>
                <Box mb="24px">
                  <SecondaryLabel>{t('Start Time')}</SecondaryLabel>
                  <TimePicker
                    disabled={Boolean(delay)}
                    name="startTime"
                    onChange={handleDateChange('startTime')}
                    selected={startTime}
                    placeholderText="00:00"
                  />
                  {formErrors.startTime && fieldsState.startTime && <FormErrors errors={formErrors.startTime} />}
                </Box>
                <Box mb="24px">
                  <SecondaryLabel>{t('End Date')}</SecondaryLabel>
                  <DatePicker
                    disabled={Boolean(period)}
                    name="endDate"
                    onChange={handleDateChange('endDate')}
                    selected={endDate}
                    placeholderText="YYYY/MM/DD"
                  />
                  {formErrors.endDate && fieldsState.endDate && <FormErrors errors={formErrors.endDate} />}
                </Box>
                <Box mb="24px">
                  <SecondaryLabel>{t('End Time')}</SecondaryLabel>
                  <TimePicker
                    disabled={Boolean(period)}
                    name="endTime"
                    onChange={handleDateChange('endTime')}
                    selected={endTime}
                    placeholderText="00:00"
                  />
                  {formErrors.endTime && fieldsState.endTime && <FormErrors errors={formErrors.endTime} />}
                </Box>
                {account && (
                  <Flex alignItems="center" mb="8px">
                    <Text color="textSubtle" mr="16px">
                      {t('Creator')}
                    </Text>
                    <ScanLink useBscCoinFallback href={getBlockExploreLink(account, 'address')}>
                      {truncateHash(account)}
                    </ScanLink>
                  </Flex>
                )}
                <Flex alignItems="center" mb="16px">
                  <Text color="textSubtle" mr="16px">
                    {t('Snapshot')}
                  </Text>
                  <ScanLink useBscCoinFallback href={getBlockExploreLink(snapshot, 'block')}>
                    {snapshot}
                  </ScanLink>
                </Flex>
                {account ? (
                  <>
                    <Button
                      type="submit"
                      width="100%"
                      isLoading={isLoading}
                      endIcon={isLoading ? <AutoRenewIcon spin color="currentColor" /> : null}
                      disabled={!isEmpty(formErrors)}
                      mb="16px"
                    >
                      {t('Publish')}
                    </Button>
                    <Text color="failure" as="p" mb="4px">
                      {t('You need at least %count% voting power to publish a proposal.', { count: VOTE_THRESHOLD })}{' '}
                    </Text>
                    <Button scale="sm" type="button" variant="text" onClick={onPresentVoteDetailsModal} p={0}>
                      {t('Check voting power')}
                    </Button>
                  </>
                ) : (
                  <ConnectWalletButton width="100%" type="button" />
                )}
              </CardBody>
            </Card>
          </Box>
        </Layout>
      </form>
      <DatePickerPortal />
    </Container>
  )
}

const Wrapped = () => {
  return (
    <Suspense fallback={<SpinnerPage />}>
      <CreateProposal />
    </Suspense>
  )
}

const FullScreenBox = styled(Box)`
  width: 100%;
  height: 50vh;
  display: flex;
  align-items: center;
  justify-content: center;
`

export const SpinnerPage = () => {
  return (
    <FullScreenBox>
      <Spinner />
    </FullScreenBox>
  )
}
export default Wrapped
