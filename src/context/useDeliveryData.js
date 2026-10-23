import { useContext } from 'react'
import { DeliveryDataContext } from './deliveryContext'

export function useDeliveryData() {
  const context = useContext(DeliveryDataContext)
  if (!context) throw new Error('useDeliveryData must be used inside DeliveryDataProvider')
  return context
}
