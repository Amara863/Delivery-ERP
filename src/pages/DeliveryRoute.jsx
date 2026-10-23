import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDeliveryData } from '../context/useDeliveryData'

const DEFAULT_CENTER = [75.7873, 26.9124] // Jaipur, Rajasthan (demo map centre)
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || ''

function DeliveryRoute() {
  const { orders, updateOrderStatus } = useDeliveryData()
  const [filter, setFilter] = useState('Active stops')
  const [tracking, setTracking] = useState(false)
  const [gpsState, setGpsState] = useState('idle')
  const [gpsError, setGpsError] = useState('')
  const [currentLocation, setCurrentLocation] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [routeMessage, setRouteMessage] = useState('')
  const mapContainer = useRef(null)
  const mapRef = useRef(null)
  const stopMarkersRef = useRef([])
  const driverMarkerRef = useRef(null)
  const watchIdRef = useRef(null)
  const routeRequestRef = useRef(0)

  const stops = useMemo(() => orders.filter((order) => (
    filter === 'All stops' || (filter === 'Active stops'
      ? ['Packed', 'Dispatched'].includes(order.status)
      : order.status === filter)
  ) && Array.isArray(order.coordinates) && order.coordinates.length === 2), [orders, filter])
  const activeStops = useMemo(() => orders.filter((order) => ['Packed', 'Dispatched'].includes(order.status) && Array.isArray(order.coordinates)), [orders])
  const delivered = orders.filter((order) => order.status === 'Delivered').length
  const cancelled = orders.filter((order) => order.status === 'Cancelled').length
  const totalWithCoordinates = orders.filter((order) => Array.isArray(order.coordinates) && order.coordinates.length === 2 && order.status !== 'Cancelled').length
  const routeProgress = totalWithCoordinates ? Math.round((delivered / totalWithCoordinates) * 100) : 0

  const advanceStop = (order) => {
    if (order.status === 'Packed') updateOrderStatus(order.id, 'Dispatched')
    else if (order.status === 'Dispatched' && window.confirm(`Mark ${order.id} as delivered?`)) updateOrderStatus(order.id, 'Delivered')
  }

  const drawRoute = useCallback(async (origin) => {
    const map = mapRef.current
    if (!map || !MAPBOX_TOKEN || activeStops.length < 1) return
    const remainingStops = activeStops.filter((order) => order.coordinates[0] !== origin[0] || order.coordinates[1] !== origin[1])
    const waypoints = [origin, ...remainingStops.map((order) => order.coordinates)]
    // Mapbox Directions accepts a limited number of coordinates per request; keep this demo route within the standard limit.
    const coordinates = waypoints.slice(0, 25).map(([lng, lat]) => `${lng},${lat}`).join(';')
    const requestId = ++routeRequestRef.current
    setRouteMessage('Calculating driving route…')
    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?geometries=geojson&overview=full&steps=true&access_token=${encodeURIComponent(MAPBOX_TOKEN)}`
      const response = await fetch(url)
      const data = await response.json()
      if (requestId !== routeRequestRef.current) return
      if (!response.ok || !data.routes?.[0]) throw new Error(data.message || 'Mapbox could not calculate this route.')
      const route = data.routes[0]
      const sourceData = { type: 'Feature', properties: {}, geometry: route.geometry }
      if (map.getSource('delivery-route')) {
        map.getSource('delivery-route').setData(sourceData)
      } else {
        map.addSource('delivery-route', { type: 'geojson', data: sourceData })
        map.addLayer({ id: 'delivery-route-line', type: 'line', source: 'delivery-route', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#248454', 'line-width': 5, 'line-opacity': 0.88 } })
      }
      setRouteMessage(`${(route.distance / 1000).toFixed(1)} km · ${Math.round(route.duration / 60)} min estimated driving time · demo route`)
      const bounds = new window.mapboxgl.LngLatBounds()
      route.geometry.coordinates.forEach((point) => bounds.extend(point))
      map.fitBounds(bounds, { padding: 55, maxZoom: 13, duration: 700 })
    } catch (error) {
      if (requestId === routeRequestRef.current) setRouteMessage(error.message || 'Unable to calculate route. Check the Mapbox token and connection.')
    }
  }, [activeStops])

  useEffect(() => {
    if (!MAPBOX_TOKEN || !mapContainer.current || !window.mapboxgl || mapRef.current) return undefined
    window.mapboxgl.accessToken = MAPBOX_TOKEN
    const map = new window.mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: DEFAULT_CENTER,
      zoom: 10.5,
      attributionControl: true,
    })
    mapRef.current = map
    map.addControl(new window.mapboxgl.NavigationControl(), 'top-right')
    map.on('load', () => {
      stopMarkersRef.current = activeStops.map((order, index) => {
        const element = document.createElement('div')
        element.className = `mapbox-stop-marker ${order.status === 'Dispatched' ? 'is-dispatched' : ''}`
        element.textContent = String(index + 1)
        element.setAttribute('aria-label', `Stop ${index + 1}: ${order.customer}`)
        const popup = new window.mapboxgl.Popup({ offset: 18 }).setHTML(`<strong>${order.customer}</strong><br>${order.id}<br>${order.address}<br><small>${order.status} · illustrative stop</small>`)
        return new window.mapboxgl.Marker({ element }).setLngLat(order.coordinates).setPopup(popup).addTo(map)
      })
      if (activeStops.length) drawRoute(activeStops[0].coordinates)
    })
    return () => {
      stopMarkersRef.current.forEach((marker) => marker.remove())
      stopMarkersRef.current = []
      driverMarkerRef.current?.remove()
      driverMarkerRef.current = null
      map.remove()
      mapRef.current = null
    }
    // Map instance is created once; route changes are handled by the following effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Boolean(MAPBOX_TOKEN)])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !window.mapboxgl) return
    stopMarkersRef.current.forEach((marker) => marker.remove())
    stopMarkersRef.current = activeStops.map((order, index) => {
      const element = document.createElement('div')
      element.className = `mapbox-stop-marker ${order.status === 'Dispatched' ? 'is-dispatched' : ''}`
      element.textContent = String(index + 1)
      const popup = new window.mapboxgl.Popup({ offset: 18 }).setHTML(`<strong>${order.customer}</strong><br>${order.id}<br>${order.address}<br><small>${order.status} · illustrative stop</small>`)
      return new window.mapboxgl.Marker({ element }).setLngLat(order.coordinates).setPopup(popup).addTo(map)
    })
    if (map.loaded() && activeStops.length) drawRoute(activeStops[0].coordinates)
  }, [activeStops, drawRoute])

  const startTracking = () => {
    setGpsError('')
    if (!navigator.geolocation) {
      setGpsState('unsupported')
      setGpsError('This browser does not support GPS location. Try an up-to-date browser on HTTPS or localhost.')
      return
    }
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current)
    setGpsState('requesting')
    watchIdRef.current = navigator.geolocation.watchPosition((position) => {
      const nextLocation = {
        longitude: position.coords.longitude,
        latitude: position.coords.latitude,
        accuracy: position.coords.accuracy,
        heading: position.coords.heading,
        speed: position.coords.speed,
        timestamp: position.timestamp,
      }
      setCurrentLocation(nextLocation)
      setLastUpdated(new Date(position.timestamp))
      setGpsState('active')
      setTracking(true)
      setGpsError('')
      const map = mapRef.current
      if (map && window.mapboxgl) {
        if (!driverMarkerRef.current) {
          const element = document.createElement('div')
          element.className = 'mapbox-driver-marker'
          element.innerHTML = '<span></span>'
          driverMarkerRef.current = new window.mapboxgl.Marker({ element }).setLngLat([nextLocation.longitude, nextLocation.latitude]).addTo(map)
        } else {
          driverMarkerRef.current.setLngLat([nextLocation.longitude, nextLocation.latitude])
        }
        map.easeTo({ center: [nextLocation.longitude, nextLocation.latitude], duration: 500 })
      }
    }, (error) => {
      setGpsState('error')
      setTracking(false)
      const messages = {
        1: 'Location permission was denied. Allow location access in your browser settings and try again.',
        2: 'Your location is currently unavailable. Check device location services and try again.',
        3: 'GPS request timed out. Try again in an area with a better location signal.',
      }
      setGpsError(messages[error.code] || 'Could not read your current location.')
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 })
  }

  
const stopTracking = () => {
  if (watchIdRef.current !== null) {
    navigator.geolocation.clearWatch(watchIdRef.current)
  }

  watchIdRef.current = null
  setTracking(false)
  setGpsState(currentLocation ? 'paused' : 'idle')
}

const endTracking = () => {
  if (watchIdRef.current !== null) {
    navigator.geolocation.clearWatch(watchIdRef.current)
  }

  watchIdRef.current = null
  setTracking(false)
  setGpsState('stopped')
  setGpsError('')

  if (driverMarkerRef.current) {
    driverMarkerRef.current.remove()
    driverMarkerRef.current = null
  }

  setCurrentLocation(null)
  setLastUpdated(null)
}

  useEffect(() => () => {
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current)
  }, [])

  const openDirections = () => {
    if (!activeStops.length) return
    const origin = currentLocation ? `${currentLocation.latitude},${currentLocation.longitude}` : `${activeStops[0].coordinates[1]},${activeStops[0].coordinates[0]}`
    const destination = activeStops[activeStops.length - 1]
    window.open(`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(`${destination.coordinates[1]},${destination.coordinates[0]}`)}&travelmode=driving`, '_blank', 'noopener,noreferrer')
  }

  return <>
    <header className="topbar professional-page-header"><div><p className="breadcrumb">Delivery Workspace / Delivery Route</p><h1>Delivery Route</h1><p className="muted-text">Plan a demo route and check this device's current GPS location.</p></div><span className="demo-pill"><i /> MAPBOX · DEMO DATA</span></header>
    <section className="route-summary-cards">
      <div className="route-summary-card"><span>Active stops</span><strong>{activeStops.length}</strong><small>Packed and dispatched demo orders</small></div>
      <div className="route-summary-card"><span>Route completion</span><strong>{routeProgress}%</strong><div className="route-progress-track"><span style={{ width: `${routeProgress}%` }} /></div><small>{delivered} delivered · {cancelled} cancelled excluded from active route</small></div>
      <div className="route-summary-card"><span>GPS tracking</span><strong className="route-planning-status">{gpsState === 'active' ? 'Active' : gpsState === 'paused' ? 'Paused' : 'Not started'}</strong><small>{lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Location is not being shared'}</small></div>
    </section>

    {!MAPBOX_TOKEN ? <section className="mapbox-setup-banner"><div className="mapbox-setup-icon">⌖</div><div><strong>Connect your Mapbox public token to load the interactive map</strong><p>Open the project’s <code>.env</code> file and set <code>VITE_MAPBOX_ACCESS_TOKEN</code>. See <code>.env.example</code> for the exact format, then restart the Vite server.</p><small>The GPS permission flow can be prepared now, but the interactive map and road route need a valid token.</small></div></section> : null}

    <section className="mapbox-workspace">
      <div className="mapbox-map-panel">
        {MAPBOX_TOKEN ? <div ref={mapContainer} className="mapbox-live-map" aria-label="Interactive delivery route map" /> : <div className="mapbox-token-placeholder"><div className="mapbox-placeholder-grid"/><div className="mapbox-placeholder-content"><span className="route-eyebrow">MAPBOX ROUTE PLANNER</span><h2>Interactive map is ready to connect</h2><p>Add your public Mapbox token to display Jaipur demo stops and road directions.</p><div className="mapbox-placeholder-stops"><span>01 · Vaishali Nagar</span><span>02 · Mansarovar</span><span>03 · Jagatpura</span></div></div></div>}
        <div className="mapbox-map-legend"><span><i className="legend-stop"/> Demo delivery stop</span><span><i className="legend-driver"/> This device's GPS</span></div>
      </div>
      <aside className="mapbox-control-panel">
        <span className="route-eyebrow">DRIVER LOCATION</span>
        <h2>Live GPS tracking</h2>
        <p className="mapbox-panel-description">Reads location from this browser/device only. Nothing is sent to a server or shared with other users in this database-free phase.</p>
        <div className={`gps-status-card gps-${gpsState}`}><span className="gps-status-dot"/><div><strong>{gpsState === 'active'
  ? 'Location is updating'
  : gpsState === 'requesting'
    ? 'Waiting for permission…'
    : gpsState === 'paused'
      ? 'Tracking paused'
      : gpsState === 'stopped'
        ? 'Tracking stopped'
        : gpsState === 'error'
          ? 'Location unavailable'
          : 'GPS not started'}</strong><small>{currentLocation ? `Accuracy ±${Math.round(currentLocation.accuracy)} m` : 'Your browser will ask for location permission'}</small></div></div>
        {currentLocation ? <div className="gps-coordinate-grid"><div><span>Latitude</span><strong>{currentLocation.latitude.toFixed(6)}</strong></div><div><span>Longitude</span><strong>{currentLocation.longitude.toFixed(6)}</strong></div></div> : null}
        {gpsError ? <p className="gps-error-message" role="alert">{gpsError}</p> : null}
        


<div className="mapbox-action-buttons">
  {tracking ? (
    <>
      <button
        type="button"
        className="secondary-button"
        onClick={stopTracking}
      >
        Pause tracking
      </button>

      <button
        type="button"
        className="secondary-button"
        onClick={endTracking}
      >
        Stop tracking
      </button>
    </>
  ) : (
    <button
      type="button"
      className="primary-button"
      onClick={startTracking}
    >
      ◎ Start live GPS
    </button>
  )}

  <button
    type="button"
    className="secondary-button"
    onClick={openDirections}
    disabled={!activeStops.length}
  >
    Open directions
  </button>
</div>



        <div className="mapbox-route-info"><span>ROUTE SUMMARY</span><strong>{activeStops.length} planned stops</strong><p>{routeMessage || 'Driving distance and ETA will appear after Mapbox calculates the route.'}</p></div>
        <p className="mapbox-privacy-note"><strong>Privacy:</strong> Stop tracking when you finish. Browser GPS can be used on localhost or a secure HTTPS deployment; production tracking needs an authenticated backend to share location with authorised viewers.</p>
      </aside>
    </section>

    <section className="orders-panel professional-orders-panel route-stops-panel"><div className="orders-heading"><div><h2>Delivery Stops</h2><p>{stops.length} stops in the current view · illustrative coordinates</p></div><div className="order-filters"><select aria-label="Filter route stops" value={filter} onChange={(event) => setFilter(event.target.value)}><option>Active stops</option><option>All stops</option><option>Delivered</option><option>Cancelled</option></select></div></div><div className="route-stop-list">{stops.length ? stops.map((order, index) => <article className="route-stop" key={order.id}><div className={`stop-number ${order.status === 'Delivered' ? 'stop-done' : ''}`}>{index + 1}</div><div className="stop-content"><div className="stop-title-row"><div><strong>{order.customer}</strong><span>{order.id}</span></div><span className={`delivery-status status-${order.status.toLowerCase()}`}>{order.status}</span></div><p>⌖ {order.address}</p><small>{order.items.map((item) => `${item.name} (${item.quantity})`).join(' · ')}</small>{['Packed', 'Dispatched'].includes(order.status) && <div className="route-stop-actions"><button type="button" className="secondary-button route-stop-action" onClick={() => advanceStop(order)}>{order.status === 'Packed' ? 'Mark dispatched' : 'Mark delivered'}</button></div>}</div></article>) : <div className="empty-orders">No stops match this filter.</div>}</div></section>
    <p className="global-demo-note"><span>ⓘ</span> Demo coordinates are approximate and illustrative, not verified customer addresses. GPS updates are local to this device and session; database/realtime sharing is intentionally deferred.</p><footer className="page-footer"><span>© E-SDMART · Delivery Workspace</span><span>Mapbox route planning · GPS demo</span></footer>
  </>
}
export default DeliveryRoute
