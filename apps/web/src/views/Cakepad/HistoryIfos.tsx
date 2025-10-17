import IfoHistoryCard from './components/IfoHistoryCard'
import { IfoV2Provider } from './contexts/IfoV2Provider'
import { useIfoConfigs } from './hooks/useIfoConfigs'

const HistoryIfos: React.FC = () => {
  const { data: ifoConfigs } = useIfoConfigs()

  return (
    <>
      {ifoConfigs.map((ifo) => (
        <IfoV2Provider id={ifo.id} key={ifo.id}>
          <IfoHistoryCard />
        </IfoV2Provider>
      ))}
    </>
  )
}

export default HistoryIfos
