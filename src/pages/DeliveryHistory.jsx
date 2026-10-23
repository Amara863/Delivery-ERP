
import { useMemo, useState } from 'react'
import { useDeliveryData } from '../context/useDeliveryData'

const formatDate = (value) =>
  value
    ? new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—'

function DeliveryHistory() {
  const { orders, loading, connectionError } = useDeliveryData()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All history')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const history = useMemo(() => {
    return orders
      .filter((order) =>
        ['Delivered', 'Cancelled'].includes(order.status)
      )
      .filter((order) => {
        const query = search.trim().toLowerCase()

        const matchesSearch = [
          order.id,
          order.customer,
          order.address,
        ].some((value) =>
          String(value || '').toLowerCase().includes(query)
        )

        const matchesStatus =
          statusFilter === 'All history' ||
          order.status === statusFilter

        const matchesFrom =
          !dateFrom ||
          (order.deliveryDate && order.deliveryDate >= dateFrom)

        const matchesTo =
          !dateTo ||
          (order.deliveryDate && order.deliveryDate <= dateTo)

        return (
          matchesSearch &&
          matchesStatus &&
          matchesFrom &&
          matchesTo
        )
      })
  }, [orders, search, statusFilter, dateFrom, dateTo])

  const deliveredCount = orders.filter(
    (order) => order.status === 'Delivered'
  ).length

  const cancelledCount = orders.filter(
    (order) => order.status === 'Cancelled'
  ).length

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('All history')
    setDateFrom('')
    setDateTo('')
  }

  return (
    <>
      <header className="topbar professional-page-header">
        <div>
          <p className="breadcrumb">
            Delivery Workspace / Delivery History
          </p>
          <h1>Delivery History</h1>
          <p className="muted-text">
            Review completed and cancelled orders from the delivery database.
          </p>
        </div>

        <span className="demo-pill">
          <i /> LIVE DATA
        </span>
      </header>

      <section className="delivery-mini-metrics history-metrics">
        <div className="mini-metric">
          <span>Completed</span>
          <strong>{deliveredCount}</strong>
        </div>

        <div className="mini-metric">
          <span>Cancelled</span>
          <strong>{cancelledCount}</strong>
        </div>

        <div className="mini-metric">
          <span>Total history</span>
          <strong>{deliveredCount + cancelledCount}</strong>
        </div>
      </section>

      <section className="orders-panel professional-orders-panel">
        <div className="orders-heading">
          <div>
            <h2>Previous Orders</h2>
            <p>
              {loading
                ? 'Loading order history...'
                : `${history.length} records match the current filters`}
            </p>
          </div>

          <div className="order-filters professional-controls">
            <input
              type="search"
              aria-label="Search delivery history"
              placeholder="Search order or customer..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              disabled={loading || Boolean(connectionError)}
            />

            <select
              aria-label="Filter history by status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              disabled={loading || Boolean(connectionError)}
            >
              <option>All history</option>
              <option>Delivered</option>
              <option>Cancelled</option>
            </select>

            <label className="date-filter-label">
              From
              <input
                type="date"
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
                disabled={loading || Boolean(connectionError)}
              />
            </label>

            <label className="date-filter-label">
              To
              <input
                type="date"
                value={dateTo}
                onChange={(event) => setDateTo(event.target.value)}
                disabled={loading || Boolean(connectionError)}
              />
            </label>
          </div>
        </div>

        <div className="responsive-table-wrap">
          <table className="professional-table">
            <thead>
              <tr>
                <th>ORDER</th>
                <th>CUSTOMER</th>
                <th>DELIVERY DATE</th>
                <th>PAYMENT MODE</th>
                <th>AMOUNT PAID</th>
                <th>FINAL STATUS</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="empty-orders">
                    Loading orders from Supabase...
                  </td>
                </tr>
              ) : connectionError ? (
                <tr>
                  <td colSpan="6" className="empty-orders">
                    <strong>Unable to load delivery history</strong>
                    <span>{connectionError}</span>
                  </td>
                </tr>
              ) : history.length ? (
                history.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong>{order.id}</strong>
                    </td>
                    <td>{order.customer}</td>
                    <td>{formatDate(order.deliveryDate)}</td>
                    <td>{order.paymentMode || '—'}</td>
                    <td>
                      ₹{Number(order.amountPaid || 0).toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span
                        className={`delivery-status status-${order.status.toLowerCase()}`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty-orders">
                    <span className="empty-state-icon">◷</span>
                    <strong>No history records found</strong>
                    <span>
                      Delivered or cancelled orders appear here.
                    </span>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={clearFilters}
                    >
                      Clear filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="demo-note">
          History is loaded from Supabase. Delivered and cancelled orders
          appear here according to their current status.
        </p>
      </section>

      {connectionError && (
        <p className="global-demo-note">
          <span>ⓘ</span> Check the database connection and permissions.
          No demo records are shown as a fallback.
        </p>
      )}

      <footer className="page-footer">
        <span>© E-SDMART · Delivery Workspace</span>
        <span>Delivery history</span>
      </footer>
    </>
  )
}

export default DeliveryHistory
