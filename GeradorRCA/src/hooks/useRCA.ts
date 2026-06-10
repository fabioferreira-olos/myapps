import { useRCAStore } from '../context/RCAContext'

export function useRCA() {
  const store = useRCAStore()
  return store
}
