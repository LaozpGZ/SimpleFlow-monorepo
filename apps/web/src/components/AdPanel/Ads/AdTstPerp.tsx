import { useTstPerpConfig } from '../hooks/useTstPerpConfig'
import { AdCommon } from './AdCommon'

export const AdTstPerp = () => {
  const config = useTstPerpConfig()
  return <AdCommon config={config.ad} />
}
