import React, { createContext, ReactNode, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { useError } from '../contexts/ErrorContext'

interface MaintenanceContextType {
  serverMaintenance: boolean;
  setServerMaintenance: (maintenance: boolean) => void;
  maintenanceMessage: string | null;
  setMaintenanceMessage: (message: string | null) => void;
  loading: boolean;
}

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined)

export const MaintenanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [serverMaintenance, setServerMaintenance] = useState(false)
  const [maintenanceMessage, setMaintenanceMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const { setServerError } = useError()

  useEffect(() => {
    axios.get('/api/server/maintenance')
      .then(response => {
        const { maintenance, message } = response.data
        if (maintenance) {
          setServerMaintenance(maintenance)
          setMaintenanceMessage(message)
        }
      })
      .catch(error => {
        console.error('Erreur lors de la vérification de la maintenance du serveur :', error)
        setServerError(error)
      }).finally(() => setLoading(false))
  }, [setServerError])

  return (
    <MaintenanceContext.Provider value={{ serverMaintenance, setServerMaintenance, maintenanceMessage, setMaintenanceMessage, loading }}>
      {children}
    </MaintenanceContext.Provider>
  )
}

export const useMaintenance = () => {
  const context = useContext(MaintenanceContext)
  if (context === undefined) {
    throw new Error('useMaintenance must be used within an MaintenanceProvider')
  }
  return context
}
