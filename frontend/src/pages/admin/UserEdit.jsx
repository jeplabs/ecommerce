import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar/Navbar';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';
import './UserEdit.css';

const ROLES = [
    { value: 'ROLE_CUSTOMER', label: 'Cliente' },
    { value: 'ROLE_ADMIN', label: 'Administrador' },
];

export default function UserEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();
    const [user, setUser] = useState(null);
    const [rol, setRol] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login', { replace: true });
            return;
        }

        const load = async () => {
            try {
                const data = await authService.getUsuarioById(id, token);
                setUser(data);
                setRol(data.rol || '');
            } catch (e) {
                showError(e.message);
                navigate('/admin/users', { replace: true });
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [id, navigate, showError]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token || !user) return;

        setSaving(true);
        try {
            const updated = await authService.updateUsuarioRol(user.id, rol, token);
            setUser(updated);
            showSuccess('Rol actualizado');
        } catch (err) {
            showError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <main className="admin-user-edit">
                    <p className="admin-user-edit__loading">Cargando usuario…</p>
                </main>
            </>
        );
    }

    if (!user) return null;

    return (
        <>
            <Navbar />
            <main className="admin-user-edit">
                <Link to="/admin/users" className="admin-user-edit__back">
                    ← Volver a usuarios
                </Link>
                <h1>Editar usuario</h1>
                <p className="admin-user-edit__lead">
                    {user.nombre} {user.apellido} · <span className="admin-user-edit__mono">{user.email}</span>
                </p>

                <div className="admin-user-edit__card">
                    <dl className="admin-user-edit__meta">
                        <div>
                            <dt>País</dt>
                            <dd>{user.pais || '—'}</dd>
                        </div>
                        <div>
                            <dt>Estado</dt>
                            <dd>
                                {user.activo ? 'Activo' : 'Inactivo'}
                                {user.bloqueado ? ' · Bloqueado' : ''}
                            </dd>
                        </div>
                        <div>
                            <dt>Intentos fallidos</dt>
                            <dd>{user.intentosFallidos ?? 0}</dd>
                        </div>
                    </dl>

                    <form className="admin-user-edit__form" onSubmit={handleSubmit}>
                        <label className="admin-user-edit__label" htmlFor="user-rol">
                            Rol en el sistema
                        </label>
                        <select
                            id="user-rol"
                            className="admin-user-edit__select"
                            value={rol}
                            onChange={(e) => setRol(e.target.value)}
                        >
                            {ROLES.map((r) => (
                                <option key={r.value} value={r.value}>
                                    {r.label}
                                </option>
                            ))}
                        </select>
                        <button
                            type="submit"
                            className="admin-user-edit__submit"
                            disabled={saving || rol === user.rol}
                        >
                            {saving ? 'Guardando…' : 'Guardar rol'}
                        </button>
                    </form>
                </div>
            </main>
        </>
    );
}
