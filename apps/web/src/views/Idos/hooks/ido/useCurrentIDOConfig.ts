import { useRouter } from 'next/router'
import { idoConfigDict } from '../../config'

export const useCurrentIDOConfig = () => {
  const { query } = useRouter()
  console.debug('debug query', query)
  const currentIdo = query.ido as string
  return { activeIdo: idoConfigDict[currentIdo] ?? idoConfigDict.myshell }
}
