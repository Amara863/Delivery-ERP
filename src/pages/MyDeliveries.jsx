import { useMemo, useState } from 'react'
import { DELIVERY_STATUSES } from '../data/mockData'
import { useDeliveryData } from '../context/useDeliveryData'

const formatMoney = (value) =>
  `₹${Number(value || 0).toLocaleString('en-IN')}`

const formatDate = (value) =>
  value
    ? new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    : '—'

function getPhoneFromAddress(address) {
  const match = String(address || '').match(/Phone:\s*([^,]+)/i)
  return match ? match[1].trim() : ''
}

function MyDeliveries() {
  const {
    orders,
    loading,
    connectionError,
    updateOrderStatus,
    refreshOrders,
  } = useDeliveryData()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const [dateFilter, setDateFilter] = useState('All dates')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [page, setPage] = useState(1)
  const [statusUpdateError, setStatusUpdateError] = useState('')
  const [updatingOrderId, setUpdatingOrderId] = useState(null)

  const pageSize = 7

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase()

    return orders.filter((order) => {
      const matchesSearch = [
        order.id,
        order.customer,
        order.address,
        order.phone,
        ...order.items.map((item) => item.name),
      ].some((value) =>
        String(value || '').toLowerCase().includes(query)
      )

      const matchesStatus =
        statusFilter === 'All statuses' ||
        order.status === statusFilter

      const matchesDate =
        dateFilter === 'All dates' ||
        (dateFilter === 'Due today'
          ? order.deliveryDate === new Date().toISOString().slice(0, 10)
          : order.status === 'Delivered' || order.status === 'Cancelled')

      return matchesSearch && matchesStatus && matchesDate
    })
  }, [orders, search, statusFilter, dateFilter])

  const pageCount = Math.max(
    1,
    Math.ceil(filteredOrders.length / pageSize)
  )

  const visibleOrders = filteredOrders.slice(
    (page - 1) * pageSize,
    page * pageSize
  )

  function downloadCsv() {
    if (loading || connectionError || !orders.length) return

    const header = [
      'Order ID',
      'Customer',
      'Order Date',
      'Delivery Date',
      'Payment Mode',
      'Amount Paid',
      'Status',
    ]

    const rows = filteredOrders.map((order) => [
      order.id,
      order.customer,
      order.orderDate,
      order.deliveryDate,
      order.paymentMode,
      order.amountPaid,
      order.status,
    ])

    const csv = [header, ...rows]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value ?? '').replaceAll('"', '""')}"`
          )
          .join(',')
      )
      .join('\r\n')

    const blob = new Blob(['\uFEFF', csv], {
      type: 'text/csv;charset=utf-8;',
    })

    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')

    anchor.href = url
    anchor.download = 'esdmart-deliveries.csv'
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  async function handleStatusChange(order, nextStatus) {
    if (nextStatus === order.status || updatingOrderId) return

    if (
      nextStatus === 'Cancelled' &&
      !window.confirm(`Cancel order ${order.id}?`)
    ) {
      return
    }

    setStatusUpdateError('')
    setUpdatingOrderId(order.id)

    try {
      await updateOrderStatus(order.id, nextStatus)

      if (selectedOrder?.id === order.id) {
        setSelectedOrder((current) =>
          current ? { ...current, status: nextStatus } : null
        )
      }
    } catch (error) {
      console.error('Could not update order status:', error)

      setStatusUpdateError(
        error?.message || 'Could not update the order status. Please try again.'
      )

      if (typeof refreshOrders === 'function') {
        try {
          await refreshOrders()
        } catch (refreshError) {
          console.error('Could not refresh orders:', refreshError)
        }
      }
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const resetFilters = () => {
    setSearch('')
    setStatusFilter('All statuses')
    setDateFilter('All dates')
    setPage(1)
  }

  return (
    <div className="deliveries-page">
      <header className="deliveries-header professional-page-header">
        <div>
          <p className="breadcrumb">Delivery Workspace / My Deliveries</p>
          <h1>My Deliveries</h1>
          <p className="deliveries-subtitle">
            Search orders, review customer details and update delivery progress.
          </p>
        </div>

        <div className="header-actions">
          <button
            className="secondary-button"
            type="button"
            onClick={downloadCsv}
            disabled={loading || Boolean(connectionError) || orders.length === 0}
          >
            ↓ Export CSV
          </button>
        </div>
      </header>

      {loading && (
        <p role="status">Loading orders from Supabase...</p>
      )}

      {!loading && connectionError && (
        <div role="alert">
          <p>Could not load orders: {connectionError}</p>
          <button
            className="secondary-button"
            type="button"
            onClick={refreshOrders}
          >
            Retry
          </button>
        </div>
      )}

      {statusUpdateError && (
        <p role="alert">
          Status update failed: {statusUpdateError}
        </p>
      )}

      {!loading && !connectionError && (
        <>
          <section className="delivery-mini-metrics">
            {[
              { label: 'All orders', value: orders.length },
              {
                label: 'Packed',
                value: orders.filter((order) => order.status === 'Packed').length,
              },
              {
                label: 'In transit',
                value: orders.filter((order) => order.status === 'Dispatched').length,
              },
              {
                label: 'Completed',
                value: orders.filter((order) => order.status === 'Delivered').length,
              },
            ].map((metric) => (
              <div className="mini-metric" key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
              </div>
            ))}
          </section>

          <section className="deliveries-panel professional-orders-panel">
            <div className="deliveries-panel-header">
              <div>
                <h2>Orders</h2>
                <p>
                  Showing{' '}
                  {filteredOrders.length
                    ? (page - 1) * pageSize + 1
                    : 0}
                  –{Math.min(page * pageSize, filteredOrders.length)} of{' '}
                  {filteredOrders.length} records
                </p>
              </div>

              <div className="deliveries-controls professional-controls">
                <label className="search-field">
                  <span>⌕</span>
                  <input
                    type="search"
                    aria-label="Search orders"
                    placeholder="Search order, customer, product..."
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value)
                      setPage(1)
                    }}
                  />
                </label>

                <select
                  aria-label="Filter by delivery status"
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value)
                    setPage(1)
                  }}
                >
                  <option>All statuses</option>
                  {DELIVERY_STATUSES.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>

                <select
                  aria-label="Filter by date"
                  value={dateFilter}
                  onChange={(event) => {
                    setDateFilter(event.target.value)
                    setPage(1)
                  }}
                >
                  <option>All dates</option>
                  <option>Due today</option>
                  <option>Final status</option>
                </select>
              </div>
            </div>

            <div className="responsive-table-wrap">
              <table className="deliveries-table professional-table">
                <thead>
                  <tr>
                    <th>ORDER / CUSTOMER</th>
                    <th>DELIVERY DATE</th>
                    <th>PAYMENT</th>
                    <th>AMOUNT PAID</th><th>DRIVER</th><th>STATUS</th>
                    <th>UPDATE STATUS</th>
                    <th>DETAILS</th>
                  </tr>
                </thead>

                <tbody>
                  {visibleOrders.length ? (
                    visibleOrders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <div className="order-cell">
                            <strong>{order.id}</strong>
                            <span>{order.customer}</span>
                          </div>
                        </td>

                        <td>{formatDate(order.deliveryDate)}</td>
                        <td>{order.paymentMode}</td>
                        <td>{formatMoney(order.amountPaid)}</td>
                        <td>{order.driverName || 'Not assigned'}</td>

                        <td>
                          <span
                            className={`delivery-status status-${String(
                              order.status
                            ).toLowerCase()}`}
                          >
                            {order.status}
                          </span>
                        </td>

                        <td>
                          <select
                            className="inline-status-select"
                            aria-label={`Update ${order.id} status`}
                            value={order.status}
                            disabled={updatingOrderId !== null}
                            onChange={(event) =>
                              handleStatusChange(order, event.target.value)
                            }
                          >
                            {DELIVERY_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="table-link-button"
                            onClick={() => setSelectedOrder(order)}
                          >
                            View details
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="empty-orders">
                        <span className="empty-state-icon">⌕</span>
                        <strong>
                          {orders.length
                            ? 'No orders found'
                            : 'No orders available'}
                        </strong>
                        <span>
                          {orders.length
                            ? 'Try changing your search or filters.'
                            : 'No orders were returned by Supabase.'}
                        </span>

                        {orders.length > 0 && (
                          <button
                            className="secondary-button"
                            type="button"
                            onClick={resetFilters}
                          >
                            Clear filters
                          </button>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="table-pagination">
              <span>Order records from Supabase</span>

              <div>
                <button
                  type="button"
                  className="pagination-button"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => current - 1)}
                >
                  ← Previous
                </button>

                <span>
                  Page {page} of {pageCount}
                </span>

                <button
                  type="button"
                  className="pagination-button"
                  disabled={page >= pageCount}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next →
                </button>
              </div>
            </div>
          </section>

          <footer className="page-footer">
            <span>Pinjrapole Gaushala · Delivery Workspace</span>
            <span>Fresh from farm to doorstep</span>
          </footer>
        </>
      )}

      {selectedOrder && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedOrder(null)
            }
          }}
        >
          <section
            className="order-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-modal-title"
          >
            <div className="modal-heading">
              <div>
                <p className="breadcrumb">Order details</p>
                <h2 id="order-modal-title">{selectedOrder.id}</h2>
                <span
                  className={`delivery-status status-${String(
                    selectedOrder.status
                  ).toLowerCase()}`}
                >
                  {selectedOrder.status}
                </span>
              </div>

              <button
                className="modal-close"
                type="button"
                aria-label="Close order details"
                onClick={() => setSelectedOrder(null)}
              >
                ×
              </button>
            </div>

            <div className="detail-customer">
              <div className="detail-avatar">
                {selectedOrder.customer
                  .split(' ')
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join('')}
              </div>

              <div>
                <strong>{selectedOrder.customer}</strong>
                <span>
                  {selectedOrder.phone ||
                    getPhoneFromAddress(selectedOrder.address) ||
                    'Phone not available'}
                </span>
                <span>{selectedOrder.address || 'Address not available'}</span>
              </div>
            </div>


            <div className="detail-grid">
              <div>
                <span>Order date</span>
                <strong>{formatDate(selectedOrder.orderDate)}</strong>
              </div>
              <div>
                <span>Delivery date</span>
                <strong>{formatDate(selectedOrder.deliveryDate)}</strong>
              </div>
              <div>
                <span>Payment mode</span>
                <strong>{selectedOrder.paymentMode}</strong>
              </div>
              <div>
                <span>Amount paid</span>
                <strong>{formatMoney(selectedOrder.amountPaid)}</strong>
              </div>
              <div>
                <span>Assigned driver</span>
                <strong>{selectedOrder.driverName || 'Not assigned'}</strong>
              </div>
            </div>


            <h3 className="detail-section-title">Order items</h3>

            <div className="detail-items">
              {selectedOrder.items.map((item, index) => (
                <div key={`${item.variantId || item.name}-${index}`}>
                  <span>
                    {item.name}
                    <small>{item.quantity}</small>
                  </span>
                  <strong>{formatMoney(item.unitPrice)}</strong>
                </div>
              ))}
            </div>

            {selectedOrder.note && (
              <div className="delivery-instruction">
                <strong>Delivery note</strong>
                <p>{selectedOrder.note}</p>
              </div>
            )}

            <div className="modal-actions">
              <button
                className="secondary-button"
                type="button"
                onClick={() => setSelectedOrder(null)}
              >
                Close
              </button>

              <label className="modal-status-label">
                Update status
                <select
                  value={selectedOrder.status}
                  disabled={updatingOrderId !== null}
                  onChange={(event) =>
                    handleStatusChange(selectedOrder, event.target.value)
                  }
                >
                  {DELIVERY_STATUSES.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </label>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default MyDeliveries