import { useAuth } from '@/app/providers';
import { useState, useEffect } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import type { UserApi } from '@/entities/user';
import { API_URL } from '@/shared/config';
import { redirectUnauthorized } from '@/shared/lib/http-session';
import { Button } from '@/shared/ui/Button';
import styles from './AdminDashboardView.module.css';

type AdminDashboardViewProps = {
    onNavigate: NavigateFunction;
};

export default function AdminDashboardView({ onNavigate }: AdminDashboardViewProps) {
    const [usuarios, setUsuarios] = useState<UserApi[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { logout } = useAuth();

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            onNavigate('/login', { replace: true });
            return;
        }

        const fetchUsuarios = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`${API_URL}/api/auth/usuarios`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    if (redirectUnauthorized(response.status, onNavigate)) {
                        return;
                    }
                    throw new Error('Error al obtener usuarios');
                }

                const data = (await response.json()) as UserApi[];
                setUsuarios(data);
            } catch (err) {
                console.error('Error al obtener usuarios', err);
                setError(err instanceof Error ? err.message : 'Error al obtener usuarios');
            } finally {
                setLoading(false);
            }
        };
        void fetchUsuarios();
    }, [onNavigate]);

    if (loading && usuarios.length === 0) {
        return <p className={styles.loading}>Cargando...</p>;
    }

    if (error) {
        onNavigate('/', { replace: true });
    }

    return (
        <main className={styles.root}>
            <h1>Admin</h1>

            <Button type="button" variant="primary" onClick={() => onNavigate('/admin/users')}>
                Usuarios
            </Button>
            <Button type="button" variant="primary" onClick={() => onNavigate('/admin/products')}>
                Productos
            </Button>
            <Button type="button" variant="primary" onClick={() => onNavigate('/admin/orders')}>
                Pedidos
            </Button>

            <Button type="button" variant="primary" onClick={logout}>
                Cerrar sesión
            </Button>
        </main>
    );
}
