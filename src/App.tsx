import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import OrdersList from './pages/OrdersList';
import OrderForm from './pages/OrderForm';
import OrderDetail from './pages/OrderDetail';
import InspectorsList from './pages/InspectorsList';
import { seedIfEmpty } from './utils/storage';

// Seed sample data on first run (synchronous, before first render)
seedIfEmpty();

function App() {

  return (
    <BrowserRouter>
      <div className="layout">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/"                    element={<Dashboard />} />
            <Route path="/orders"              element={<OrdersList />} />
            <Route path="/orders/new"          element={<OrderForm />} />
            <Route path="/orders/:id"          element={<OrderDetail />} />
            <Route path="/orders/:id/edit"     element={<OrderForm />} />
            <Route path="/inspectors"          element={<InspectorsList />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
