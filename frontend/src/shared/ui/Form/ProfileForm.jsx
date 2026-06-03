import { useState } from 'react';

// Recibe los datos del usuario y una función para guardar los cambios
export default function ProfileForm({ user, onSave, onCancel }) {
    // Estado local para el formulario (inicializado con los datos del usuario)
    const [formData, setFormData] = useState({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        pais: user.pais || '',
        // Estos campos NO se pueden editar, pero los mantenemos para mostrarlos
        email: user.email || '',
        rol: user.rol || '',
        id: user.id || ''
    });

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Manejar cambios en los inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Manejar el envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Solo enviamos los campos que se pueden editar
            const datosParaEnviar = {
                nombre: formData.nombre,
                apellido: formData.apellido,
                pais: formData.pais
                // No enviamos email, rol, ni id
            };

            await onSave(datosParaEnviar);
            setIsEditing(false); // Salir del modo edición si fue exitoso
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isEditing) {
        // --- VISTA DE SOLO LECTURA ---
        return (
            <div className="profile-view form-box">
                <h2>Detalles del Usuario</h2>
                <div style={{ marginBottom: '10px' }}>
                    <strong>Nombre:</strong> {formData.nombre} {formData.apellido}
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <strong>País:</strong> {formData.pais}
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <strong>Email:</strong> {formData.email} <span style={{fontSize: '0.8em', color: '#666'}}>(No editable)</span>
                </div>
                {/* <div style={{ marginBottom: '10px' }}>
                    <strong>Rol:</strong> {formData.rol} <span style={{fontSize: '0.8em', color: '#666'}}>(No editable)</span>
                </div> */}
                {/* <div style={{ marginBottom: '20px' }}>
                    <strong>ID:</strong> {formData.id} <span style={{fontSize: '0.8em', color: '#666'}}>(No editable)</span>
                </div> */}
                
                <button 
                    className='btn-submit'
                    onClick={() => setIsEditing(true)} 
                    //style={{ padding: '8px 16px', cursor: 'pointer' }}
                >
                    Editar Perfil
                </button>
            </div>
        );
    }

    // --- VISTA DE EDICIÓN ---
    return (
        <form onSubmit={handleSubmit} className="form-box">
            <h2>Editar Perfil</h2>
            
            {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}

            {/* Campos Editables */}
            <div 
                //style={{ marginBottom: '15px' }}
            >
                <label>Nombre:</label>
                <input 
                    type="text" 
                    name="nombre" 
                    value={formData.nombre} 
                    onChange={handleChange} 
                    required 
                    //style={{ width: '100%', padding: '8px' }}
                />
            </div>

            <div 
                //style={{ marginBottom: '15px' }}
            >
                <label>Apellido:</label>
                <input 
                    type="text" 
                    name="apellido" 
                    value={formData.apellido} 
                    onChange={handleChange} 
                    required 
                    //style={{ width: '100%', padding: '8px' }}
                />
            </div>

            <div 
                //style={{ marginBottom: '15px' }}
            >
                <label>País:</label>
                <input 
                    type="text" 
                    name="pais" 
                    value={formData.pais} 
                    onChange={handleChange} 
                    required 
                    //style={{ width: '100%', padding: '8px' }}
                />
            </div>

            {/* Campos de Solo Lectura (Visuales) */}
            <div 
                style={{ 
                    //marginBottom: '15px', 
                    opacity: 0.6, 
                    pointerEvents: 'none' 
                }}
            >
                <label>Email:</label>
                <input 
                    type="email" 
                    value={formData.email} 
                    //style={{ width: '100%', padding: '8px', backgroundColor: '#f0f0f0' }}
                    tabIndex={-1}
                />
            </div>

            {/* <div 
                style={{ 
                    marginBottom: '15px', 
                    opacity: 0.6, 
                    pointerEvents: 'none' 
                }}
            >
                <label>Rol:</label>
                <input 
                    type="text" 
                    value={formData.rol} 
                    //style={{ width: '100%', padding: '8px', backgroundColor: '#f0f0f0' }}
                    tabIndex={-1}
                />
            </div> */}

            <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                    className='btn-submit' 
                    type="submit" 
                    disabled={loading} 
                    style={{ padding: '8px 16px', cursor: 'pointer' }}
                >
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
                <button className='btn-submit'
                    type="button" 
                    onClick={() => {
                        setIsEditing(false);
                        onCancel(); // Opcional: para resetear cambios si el usuario cancela
                    }} 
                    disabled={loading}
                    //style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#ccc' }}
                >
                    Cancelar
                </button>
            </div>
        </form>
    );
}