import { createContext, useContext } from 'react'
import { useTrainingPlans } from '../hooks/useTrainingPlans.js'

const TrainingPlansContext = createContext(null)

export function TrainingPlansProvider({ children }) {
  const value = useTrainingPlans()
  return (
    <TrainingPlansContext.Provider value={value}>
      {children}
    </TrainingPlansContext.Provider>
  )
}

export function usePlans() {
  const ctx = useContext(TrainingPlansContext)
  if (!ctx) {
    throw new Error('usePlans must be used within a TrainingPlansProvider')
  }
  return ctx
}
