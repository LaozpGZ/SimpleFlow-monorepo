import CurrentIfo from './CurrentIfo'
import { useCurrentIDOConfig } from './hooks/ido/useCurrentIDOConfig'

const Ido = () => {
  const { activeIdo } = useCurrentIDOConfig()
  return <CurrentIfo activeIdo={activeIdo} />
}

export default Ido
