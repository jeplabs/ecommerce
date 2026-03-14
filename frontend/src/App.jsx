import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Admin from './pages/admin/Admin'
import ProductList from './pages/admin/ProductList'
import ProductNew from './pages/admin/ProductNew'
import UsersList from './pages/admin/UsersList'

function App() {

  return (
    // <BrowserRouter> Enrutamiento de rutas home, login y register
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/products" element={<ProductList />} />
        <Route path="/admin/products/new" element={<ProductNew />} />
        <Route path="/admin/users" element={<UsersList />} />
      </Routes>
    </Router>
  )
}

export default App
