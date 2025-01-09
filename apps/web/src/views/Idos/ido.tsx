import CurrentIfo from './CurrentIfo'
import { IfoPlaceholder } from './IfoPlaceholder'
import SoonIfo from './SoonIfo'
import { useCurrentIDOConfig } from './hooks/ido/useCurrentIDOConfig'

const Ifo = () => {
  const { activeIfo, isPending } = useCurrentIDOConfig()
  return activeIfo ? <CurrentIfo activeIfo={activeIfo} /> : isPending ? <IfoPlaceholder /> : <SoonIfo />
}

export default Ifo
