
import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { DeliveryDataContext } from './deliveryContext'

const STATUS_FROM_DB = {
  Pending: 'Packed',
  'Out for delivery': 'Dispatched',
  Delivered: 'Delivered',
  Cancelled: 'Cancelled',
}

const STATUS_TO_DB = {
  Packed: 'Pending',
  Dispatched: 'Out for delivery',
  Delivered: 'Delivered',
  Cancelled: 'Cancelled',
}

function mapOrder(row) {
  const profile = row.profiles
  const orderItems = row.order_items ?? []
  const driver = row.drivers
  const staff = driver?.staff

  return {
    id: row.order_id,
    customer: profile?.full_name ?? 'Customer',
    phone: profile?.phone ?? '',
    address: row.delivery_address ?? '',
    orderDate: row.order_date ?? '',
    deliveryDate: row.delivery_date ?? '',
    paymentMode: row.payment_mode ?? '',
    amountPaid: Number(row.amount_paid ?? 0),
    status: STATUS_FROM_DB[row.delivery_status] ?? row.delivery_status,
    driverId: row.driver_id ?? null,
    driverName: staff?.name ?? 'Not assigned',
    coordinates: null,

    items: orderItems.map((item) => {
      const variant = item.product_variants
      const product = variant?.products
      const productName = product?.product_name
      const size = variant?.size

      return {
        name: productName
          ? `${productName}${size ? ` — ${size}` : ''}`
          : size
            ? `${size} variant`
            : `Variant ${item.variant_id}`,
        quantity: String(item.quantity ?? 0),
        unitPrice: Number(item.unit_price ?? 0),
        variantId: item.variant_id,
      }
    }),
  }
}

export function DeliveryDataProvider({ children }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [connectionError, setConnectionError] = useState('')

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setConnectionError('')

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          order_id,
          profile_id,
          order_date,
          delivery_date,
          driver_id,
          delivery_address,
          delivery_status,
          payment_mode,
          amount_paid,
          profiles (
            full_name,
            phone
          ),
          drivers (
            staff (
              name
            )
          ),
          order_items (
            variant_id,
            quantity,
            unit_price,
            product_variants (
              size,
              products (
                product_name
              )
            )
          )
        `)
        .order('order_date', { ascending: false })

      if (error) {
        throw error
      }

      setOrders((data ?? []).map(mapOrder))
    } catch (error) {
      console.error('Supabase orders fetch failed:', error)
      setConnectionError(error.message || 'Unable to load orders.')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const updateOrderStatus = useCallback(async (orderId, nextStatus) => {
    const databaseStatus = STATUS_TO_DB[nextStatus]

    if (!databaseStatus) {
      throw new Error(`Unsupported delivery status: ${nextStatus}`)
    }

    const currentOrder = orders.find((order) => order.id === orderId)

    if (!currentOrder) {
      throw new Error('Order not found.')
    }

    const updatePayload = {
      delivery_status: databaseStatus,
    }

    if (nextStatus === 'Delivered') {
      updatePayload.delivery_date = new Date()
        .toISOString()
        .slice(0, 10)
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('order_id', orderId)
      .select('order_id')

    if (error) {
      console.error('Supabase status update failed:', error)
      throw error
    }

    if (!data?.length) {
      throw new Error(
        'No order was updated. Check Supabase permissions and order access.'
      )
    }

    await fetchOrders()
  }, [orders, fetchOrders])

  const value = useMemo(() => ({
    orders,
    loading,
    connectionError,
    updateOrderStatus,
    refreshOrders: fetchOrders,
  }), [
    orders,
    loading,
    connectionError,
    updateOrderStatus,
    fetchOrders,
  ])

  return (
    <DeliveryDataContext.Provider value={value}>
      {children}
    </DeliveryDataContext.Provider>
  )
}
