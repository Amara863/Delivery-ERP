
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import Layout from './components/Layout'
import Overview from './pages/Overview'
import MyDeliveries from './pages/MyDeliveries'
import DeliveryRoute from './pages/DeliveryRoute'
import DeliveryHistory from './pages/DeliveryHistory'
import MyProfile from './pages/MyProfile'
import './App.css'
import { DeliveryDataProvider } from './context/DeliveryDataContext'

function App() {
  return (
    <DeliveryDataProvider>
      <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
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
      </Routes>
      </BrowserRouter>
    </DeliveryDataProvider>
  )
}

export default App
