import { getTeams } from 'state/teams/helpers'
import { TeamsById } from 'state/types'
import { atomWithAsyncRetry } from 'utils/atomWithAsyncRetry'

export const teamsAtom = atomWithAsyncRetry<TeamsById | null>({
  asyncFn: async () => {
    const data = await getTeams()
    return data ?? null
  },
  fallbackValue: {},
})
