import './App.css'
import AppRouter from './router/AppRouter'
import { AuthProvider } from './context/AuthContext'
import { ProductProvider } from './context/ProductContext'
import { CategoriasProvider } from './context/CategoriasContext'
import { ToastProvider } from './context/ToastContext'

function App() {

  return (
    <AuthProvider>
      <CategoriasProvider>
        <ProductProvider> 
          <ToastProvider>
            <AppRouter />
          </ToastProvider>
        </ProductProvider>
      </CategoriasProvider>
    </AuthProvider>
  )
}

export default App
