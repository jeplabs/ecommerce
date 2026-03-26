import './App.css'
import AppRouter from './router/AppRouter'
import { AuthProvider } from './context/AuthContext'
import { ProductProvider } from './context/ProductContext'
import { ToastProvider } from './context/ToastContext'

function App() {

  return (
    <AuthProvider>
      <ProductProvider>
        <ToastProvider>
          <AppRouter />
        </ToastProvider>
      </ProductProvider>
    </AuthProvider>
  )
}

export default App
