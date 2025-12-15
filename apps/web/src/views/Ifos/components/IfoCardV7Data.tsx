import { Ifo } from '@pancakeswap/ifos'

import IfoFoldableCard from './IfoFoldableCard'

interface Props {
  ifo: Ifo
}

export const IfoCardV7Data: React.FC<React.PropsWithChildren<Props>> = ({ ifo }) => {
  return <IfoFoldableCard ifo={ifo} />
}
