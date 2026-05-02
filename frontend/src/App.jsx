import './App.css'
import AppRouter from './router/AppRouter'
import { AuthProvider } from './context/AuthContext'
import { ProductProvider } from './context/ProductContext'
import { CategoriasProvider } from './context/CategoriasContext'
import { ToastProvider } from './context/ToastContext'
import { CartProvider } from './context/CartContext'

function App() {

  return (
    <AuthProvider>
      <ProductProvider>
        <CartProvider>
          <CategoriasProvider>
            <ToastProvider>
              <AppRouter />
            </ToastProvider>
          </CategoriasProvider>
        </CartProvider>
      </ProductProvider>
    </AuthProvider>
  )
}

export default App
