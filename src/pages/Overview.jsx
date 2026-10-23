
import { Link } from 'react-router-dom'
import cowImage from '../assets/gaushala-cows.png'
import { useDeliveryData } from '../context/useDeliveryData'

const statusColors = {
  Packed: '#d5a037',
  Dispatched: '#4288b8',
  Delivered: '#32855e',
  Cancelled: '#c45a51',
}

function Overview() {
  const { orders, loading, connectionError } = useDeliveryData()

  const counts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1
    return acc
  }, {})

  const delivered = counts.Delivered || 0
  const completion = orders.length
    ? Math.round((delivered / orders.length) * 100)
    : 0

  const totalAmount = orders.reduce(
    (sum, order) => sum + Number(order.amountPaid || 0),
    0
  )

  const today = new Date().toLocaleDateString('en-CA')
  const todaysOrders = orders.filter(
    (order) => order.deliveryDate === today
  ).length

  const recentOrders = [...orders].slice(0, 5)

  if (loading) {
    return (
      <div className="overview-page">
        <header className="overview-header">
          <div>
            <p className="breadcrumb">Delivery Workspace / Overview</p>
            <h1>Delivery Dashboard</h1>
          </div>
        </header>
        <section className="dashboard-panel">
          Loading orders from Supabase...
        </section>
      </div>
    )
  }

  if (connectionError) {
    return (
      <div className="overview-page">
        <header className="overview-header">
          <div>
            <p className="breadcrumb">Delivery Workspace / Overview</p>
            <h1>Delivery Dashboard</h1>
          </div>
        </header>
        <section className="dashboard-panel">
          <h2>Unable to load delivery data</h2>
          <p>{connectionError}</p>
          <p>Please check the Supabase connection and try again.</p>
        </section>
      </div>
    )
  }

  return (
    <div className="overview-page">
      <header className="overview-header">
        <div>
          <p className="breadcrumb">Delivery Workspace / Overview</p>
          <h1>Delivery Dashboard</h1>
          <p className="muted-text">
            Your delivery operations, powered by live database records.
          </p>
        </div>

        <div className="overview-actions">
          <span className="demo-pill">
            <i /> LIVE DATA
          </span>
          <Link className="primary-button" to="/deliveries">
            View orders <span>→</span>
          </Link>
        </div>
      </header>

      <section className="delivery-welcome dashboard-welcome">
        <div className="welcome-copy">
          <span className="welcome-label">
            PINJRAPOLE GAUSHALA · DELIVERY OPERATIONS
          </span>
          <h2>Every delivery,<br />handled with care.</h2>
          <p>
            Monitor current orders, track delivery progress, and keep
            delivery statuses up to date.
          </p>

          <Link className="welcome-button" to="/deliveries">
            Open My Deliveries <span>→</span>
          </Link>

          <div className="welcome-values">
            <div>
              <strong>{orders.length}</strong>
              <span>Total orders</span>
            </div>
            <div>
              <strong>{completion}%</strong>
              <span>Delivered</span>
            </div>
            <div>
              <strong>{todaysOrders}</strong>
              <span>Due today</span>
            </div>
          </div>
        </div>

        <div className="welcome-art">
          <img
            className="gaushala-photo"
            src={cowImage}
            alt="Cows at Pinjrapole Gaushala"
          />
        </div>
      </section>

      <section className="dashboard-metrics" aria-label="Delivery summary">
        {[
          {
            label: "Today's Orders",
            value: todaysOrders,
            note: 'Scheduled for today',
            icon: '▦',
            tone: 'mint',
          },
          {
            label: 'Packed',
            value: counts.Packed || 0,
            note: 'Ready for dispatch',
            icon: '▣',
            tone: 'gold',
          },
          {
            label: 'Dispatched',
            value: counts.Dispatched || 0,
            note: 'Out for delivery',
            icon: '➜',
            tone: 'blue',
          },
          {
            label: 'Delivered',
            value: delivered,
            note: `${completion}% of all loaded orders`,
            icon: '✓',
            tone: 'mint',
          },
        ].map((card) => (
          <article className="metric-card" key={card.label}>
            <span className={`metric-icon ${card.tone}`}>
              {card.icon}
            </span>
            <div className="metric-copy">
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              <small>{card.note}</small>
            </div>
          </article>
        ))}
      </section>

      <section className="dashboard-lower-grid">
        <article className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h2>Order Status Overview</h2>
              <p>Based on current Supabase records</p>
            </div>
            <span className="panel-icon">◷</span>
          </div>

          <div className="status-breakdown">
            {['Packed', 'Dispatched', 'Delivered', 'Cancelled'].map(
              (status) => {
                const count = counts[status] || 0
                const percent = orders.length
                  ? (count / orders.length) * 100
                  : 0

                return (
                  <div className="status-bar-row" key={status}>
                    <div className="status-bar-label">
                      <span>{status}</span>
                      <strong>{count}</strong>
                    </div>
                    <div className="status-track">
                      <span
                        style={{
                          width: `${percent}%`,
                          background: statusColors[status],
                        }}
                      />
                    </div>
                  </div>
                )
              }
            )}
          </div>

          <div className="panel-footnote">
            Amount recorded as paid across loaded orders:{' '}
            <strong>
              ₹{totalAmount.toLocaleString('en-IN')}
            </strong>
          </div>
        </article>

        <article className="dashboard-panel attention-panel">
          <div className="panel-heading">
            <div>
              <h2>Delivery Snapshot</h2>
              <p>Quick actions for your workflow</p>
            </div>
            <span className="panel-icon">↗</span>
          </div>

          <Link to="/deliveries" className="quick-action">
            <span className="quick-action-icon">▤</span>
            <span>
              <strong>Review all orders</strong>
              <small>Search and update order status</small>
            </span>
            <b>→</b>
          </Link>

          <Link to="/route" className="quick-action">
            <span className="quick-action-icon">⌖</span>
            <span>
              <strong>Open delivery route</strong>
              <small>Review delivery stops</small>
            </span>
            <b>→</b>
          </Link>

          <Link to="/history" className="quick-action">
            <span className="quick-action-icon">◷</span>
            <span>
              <strong>Delivery history</strong>
              <small>See delivered and cancelled orders</small>
            </span>
            <b>→</b>
          </Link>
        </article>
      </section>

      <section className="dashboard-panel recent-panel">
        <div className="panel-heading">
          <div>
            <h2>Recent Orders</h2>
            <p>Latest orders loaded from Supabase</p>
          </div>
          <Link className="text-link" to="/deliveries">
            Manage orders →
          </Link>
        </div>

        <div className="responsive-table-wrap">
          <table className="professional-table">
            <thead>
              <tr>
                <th>ORDER</th>
                <th>CUSTOMER</th>
                <th>DELIVERY DATE</th>
                <th>AMOUNT PAID</th>
                <th>STATUS</th>
                <th>DETAILS</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length ? (
                recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td><strong>{order.id}</strong></td>
                    <td>{order.customer}</td>
                    <td>{order.deliveryDate || '—'}</td>
                    <td>
                      ₹{Number(order.amountPaid).toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span
                        className={`delivery-status status-${order.status.toLowerCase()}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <Link className="table-link" to="/deliveries">
                        Open
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty-orders">
                    No orders found in Supabase.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="overview-footer">
        <span>© E-SDMART · Pinjrapole Gaushala</span>
        <span>Delivery operations workspace</span>
      </footer>
    </div>
  )
}

export default Overview
