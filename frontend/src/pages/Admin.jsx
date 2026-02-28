import Navbar from "../components/Navbar"

export default function Admin() {

    const listaUsuarios = async () => {
        try {
            const response = await fetch('http://localhost:8081/api/auth/usuarios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
            throw new Error('Credenciales inválidas');
            }

            const data = await response.json();
            
            console.log(data);
        } catch (error) {
            // Muestra mensaje de error al usuario
            console.error('Error', error);
            setError('Credenciales inválidas');
        }
    };

    return (
        <>
            <Navbar />
            <h1>Admin</h1>
            <button onClick={listaUsuarios}>Lista de usuarios</button>

        </>
    )
}