import { createContext, useContext, useState, useCallback } from 'react'

const PetContext = createContext(null)

const DEFAULT_PET = 'mimi'

export function PetProvider({ children }) {
  const [petType, setPetTypeState] = useState(
    () => localStorage.getItem('criterionPet') || DEFAULT_PET
  )
  const [petName, setPetNameState] = useState(
    () => localStorage.getItem('criterionPetName') || ''
  )

  const setPetType = useCallback((type) => {
    localStorage.setItem('criterionPet', type)
    setPetTypeState(type)
  }, [])

  const setPetName = useCallback((name) => {
    localStorage.setItem('criterionPetName', name)
    setPetNameState(name)
  }, [])

  return (
    <PetContext.Provider value={{ petType, petName, setPetType, setPetName }}>
      {children}
    </PetContext.Provider>
  )
}

export function usePet() {
  const ctx = useContext(PetContext)
  if (!ctx) throw new Error('usePet must be used inside PetProvider')
  return ctx
}
