import './App.css';
import { AppRouter } from '@/app/router';
import { AppProviders } from '@/app/providers';

function App() {
    return (
        <AppProviders>
            <AppRouter />
        </AppProviders>
    );
}

export default App;
