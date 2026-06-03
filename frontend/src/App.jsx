import './App.css';
import AppRouter from './router/AppRouter';
import { AppProviders } from '@/app/providers';

function App() {
    return (
        <AppProviders>
            <AppRouter />
        </AppProviders>
    );
}

export default App;
