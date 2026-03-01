export default function LoginForm() {
    return (
        <form>
            <label for="email">Correo electrónico</label>
            <input type="email" id="email" name="email" />
            <label for="password">Contraseña</label>
            <input type="password" id="password" name="password" />
            <br />
            <button type="submit">Iniciar sesión</button>
        </form>
    )
}