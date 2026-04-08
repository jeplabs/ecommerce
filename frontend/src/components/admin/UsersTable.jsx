import { useNavigate } from 'react-router-dom';

export const UsersTable = ({ users, loading, error, desactivarUsuario, activarUsuario }) => {
    const navigate = useNavigate();

    const handleEdit = (id) => {
        // Redirige a la ruta de edición con el ID del usuario
        navigate(`/admin/users/${id}/edit`);
    };

    const handleDelete = (id) => {
        const confirmDelete = window.confirm("¿Estás seguro de que deseas desactivar este usuario?");
        if (confirmDelete) {
            console.log(`Desactivar usuario con ID: ${id}`);
            // Aquí podrías llamar a una función onDelete(id) pasada desde el padre
            desactivarUsuario(id);
        }
    };
    // console.log("Usuarios recibidos en UsersTable:", users);

    const handleActivate = (id) => {
        const confirmActivate = window.confirm("¿Estás seguro de que deseas activar este usuario?");
        if (confirmActivate) {
            console.log(`Activar usuario con ID: ${id}`);
            // Aquí podrías llamar a una función onActivate(id) pasada desde el padre
            activarUsuario(id);
        }
    };

    if (loading) {
        return <div className="loading-container"><p>Cargando usuarios...</p></div>;
    }

    if (error) {
        return <div className="error-container"><p style={{color: 'red'}}>Error: {error}</p></div>;
    }

    if (!users || users.length === 0) {
        return <div className="empty-state"><p>No hay usuarios registrados.</p></div>;
    }

    return (
        <div className="table-container">
            <div className="table-header">
                <h2>Lista de Usuarios</h2>
            </div>
            
            <div className="table-responsive">
                <table className="modern-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>Email</th>
                            <th>País</th>
                            <th>Rol</th>
                            <th>Estado</th>
                            <th className="text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.nombre}</td>
                                <td>{user.apellido}</td>
                                <td>{user.email}</td>
                                <td>{user.pais}</td>
                                <td>
                                    <span className={`badge badge-${user.rol ? user.rol.toLowerCase() : 'user'}`}>
                                        {user.rol}
                                    </span>
                                </td>
                                <td>
                                    <span>
                                        {user.activo ? 'Activo' : 'Desactivado'}
                                    </span>
                                </td>
                                <td className="actions-cell">
                                    <button 
                                        className="btn-edit" 
                                        onClick={() => handleEdit(user.id)}
                                        title="Editar usuario"
                                    >
                                        Editar
                                    </button>
                                    {user.activo ? (
                                        <button 
                                            className="btn-delete" 
                                            onClick={() => handleDelete(user.id)}
                                            title="Desactivar usuario"
                                        >
                                            Desactivar
                                        </button>
                                        
                                    ) : (
                                        <button 
                                            className="btn-edit" 
                                            onClick={() => handleActivate(user.id)}
                                            title="Activar usuario"
                                        >
                                            Activar
                                        </button>
                                    )}
                                    
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UsersTable;