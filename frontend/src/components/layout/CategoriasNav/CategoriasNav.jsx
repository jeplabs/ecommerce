import { useState } from "react";
import { Link } from "react-router-dom";
import { useCategorias } from "../../../context/CategoriasContext";
import "./CategoriasNav.css";

// --- Componente Recursivo (Sin cambios) ---
const MenuItem = ({ cat, nivel, nivelesAbiertos, setNivelesAbiertos }) => {
    const hijos = cat.subcategorias || [];
    const tieneHijos = hijos.length > 0;
    const estaAbierto = nivelesAbiertos[nivel] === cat.id;

    const toggle = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setNivelesAbiertos(prev => {
            const nuevoEstado = { ...prev };
            if (estaAbierto) {
                delete nuevoEstado[nivel];
                for (let i = nivel + 1; i < 10; i++) delete nuevoEstado[i];
            } else {
                nuevoEstado[nivel] = cat.id;
                for (let i = nivel + 1; i < 10; i++) delete nuevoEstado[i];
            }
            return nuevoEstado;
        });
    };

    return (
        <li className={`cat-item ${estaAbierto ? 'abierto' : ''}`}>
            <div className="cat-row">
                <Link to={`/categoria/${cat.id}`} className="cat-link-text">
                    {cat.nombre}
                </Link>
                {tieneHijos && (
                    <button className="cat-arrow-btn" onClick={toggle}>
                        <span className={`material-symbols-outlined ${estaAbierto ? 'rotado' : ''}`}>
                            {estaAbierto ? 'expand_less' : 'expand_more'}
                        </span>
                    </button>
                )}
            </div>
            {tieneHijos && (
                <ul className={`cat-submenu ${estaAbierto ? 'visible' : ''}`}>
                    {hijos.map((hijo) => (
                        <MenuItem 
                            key={hijo.id}
                            cat={hijo}
                            nivel={nivel + 1}
                            nivelesAbiertos={nivelesAbiertos}
                            setNivelesAbiertos={setNivelesAbiertos}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
};

// --- Componente Principal (Con el botón toggle) ---
const CategoriasNav = () => {
    const { arbolCategorias, loading } = useCategorias();
    const [nivelesAbiertos, setNivelesAbiertos] = useState({});
    
    // NUEVO ESTADO: Controla si el menú completo está visible
    const [menuVisible, setMenuVisible] = useState(false);

    const toggleMenuPrincipal = (e) => {
        e.preventDefault();
        setMenuVisible(!menuVisible);
        // Opcional: Si quieres que al cerrar el menú principal también se limpien las subcategorías abiertas:
        if (menuVisible) setNivelesAbiertos({});
    };

    if (loading || !arbolCategorias || arbolCategorias.length === 0) return null;

    return (
        <div className="categorias-wrapper">
            <div className="categorias-container">
                
                {/* BOTÓN PRINCIPAL (Siempre visible) */}
                <button className="btn-ver-categorias" onClick={toggleMenuPrincipal}>
                    <span className="material-symbols-outlined icono-menu">
                        {menuVisible ? 'close' : 'menu'} 
                    </span>
                    <span className="texto-btn">
                        {menuVisible ? 'Ocultar Categorías' : 'Ver Categorías'}
                    </span>
                </button>

                {/* LISTA DE CATEGORÍAS (Solo visible si menuVisible es true) */}
                    <ul className={`categorias-lista lista-categorias ${!menuVisible ? 'oculto-mobile' : ''}`}>
                        {arbolCategorias.map((cat) => (
                            <MenuItem 
                                key={cat.id}
                                cat={cat}
                                nivel={0}
                                nivelesAbiertos={nivelesAbiertos}
                                setNivelesAbiertos={setNivelesAbiertos}
                            />
                        ))}
                    </ul>
            </div>
        </div>
    );
};

export default CategoriasNav;