import { useTstPerpConfig } from '../hooks/useTstPerpConfig'
import { InfoStripeCommon } from './InfoStripeCommon'

export const TstPerpInfoStripe = () => {
  const config = useTstPerpConfig()

  return <InfoStripeCommon config={config.infoStripe} />
}
