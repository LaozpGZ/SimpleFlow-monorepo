import { Ifo } from '@pancakeswap/ifos'
import IfoFoldableCard from './IfoFoldableCard'

interface Props {
  ifo: Ifo
}

const IfoCardV3Data: React.FC<React.PropsWithChildren<Props>> = ({ ifo }) => {
  return <IfoFoldableCard ifo={ifo} />
}

export default IfoCardV3Data
