import { Atom, ExtractAtomValue } from 'jotai'
import { loadable } from 'jotai/utils'

export type LoadableWithType<T> = Atom<{
  state: 'loading' | 'hasData' | 'hasError'
  data?: ExtractAtomValue<T>
  error?: unknown
}>

export const createLoadableAtom = <T extends Atom<any>>(atom: T) => {
  return loadable(atom) as LoadableWithType<Awaited<T>>
}

export const areLoadablesValid = (loadables: ExtractAtomValue<LoadableWithType<any>>[]) => {
  return loadables.every((loadable) => loadable.state === 'hasData')
}
