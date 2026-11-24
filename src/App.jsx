import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import Layout from './components/Layout'
import DriverLogin, { DRIVER_SESSION_KEY } from './pages/DriverLogin'
import Overview from './pages/Overview'
import MyDeliveries from './pages/MyDeliveries'
import DeliveryRoute from './pages/DeliveryRoute'
import DeliveryHistory from './pages/DeliveryHistory'
import MyProfile from './pages/MyProfile'
import './App.css'
import { DeliveryDataProvider } from './context/DeliveryDataContext'

function ProtectedRoute({ children }) {
  const session = localStorage.getItem(DRIVER_SESSION_KEY)
  if (!session) {
    return <Navigate to="/login" replace />
  }
  return children
}

function App() {
  return (
    <DeliveryDataProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<DriverLogin />} />

          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route
              path="/"
              element={<Navigate to="/overview" replace />}
            />
            <Route path="/overview" element={<Overview />} />
            <Route path="/deliveries" element={<MyDeliveries />} />
            <Route path="/route" element={<DeliveryRoute />} />
            <Route path="/history" element={<DeliveryHistory />} />
            <Route path="/profile" element={<MyProfile />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </DeliveryDataProvider>
  )
}

export default App