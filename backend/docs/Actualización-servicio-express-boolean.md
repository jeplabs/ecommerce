# Documentación de API: Gestión de Servicios de Envío (actualización campo boolean Servicio Express)

Esta documentación describe los endpoints disponibles para la creación y actualización de servicios de envío, diseñada para ser probada y ejecutada fácilmente mediante la herramienta **Insomnia**.

## 🔐 Autenticación

Todas las solicitudes a esta API requieren un token de autenticación válido con privilegios de administrador. Debe incluirse en los encabezados (*headers*) de cada petición.

- **Clave**: `Authorization`
- **Valor**: `Bearer <token_admin>`

---

## 📡 Endpoints

### 1. Crear un nuevo servicio de envío

Registra un nuevo servicio de envío en el sistema, permitiendo definir su nombre, descripción, costos y si posee la modalidad express.

- **Método HTTP**: `POST`
- **Ruta**: `/api/envio`

#### Encabezados (Headers)
| Clave | Valor | Requerido |
|-------|-------|:---------:|
| `Authorization` | `Bearer <token_admin>` | Sí |
| `Content-Type` | `application/json` | Sí |

#### Cuerpo de la solicitud (Body)
```json
{
    "nombre": "Guatex Express",
    "descripcion": "Entrega en 24 horas",
    "tarifa": 75.00,
    "recargoContraEntrega": 20.00,
    "servicioExpress": true
}
```

#### Campos del Body
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `nombre` | string | Nombre comercial del servicio de envío. |
| `descripcion` | string | Breve descripción de las condiciones del servicio. |
| `tarifa` | number | Costo base del servicio. |
| `recargoContraEntrega` | number | Este campo ya no se usará, por defecto llevará valor cero. |
| `servicioExpress` | boolean | Indica si el servicio tiene prioridad express. |

---

### 2. Actualizar un servicio existente

Modifica parcialmente los atributos de un servicio de envío ya registrado. En el siguiente ejemplo, se actualiza un servicio existente para activar la modalidad express.

- **Método HTTP**: `PATCH`
- **Ruta**: `/api/envio/{id}` *(Reemplace `{id}` con el identificador numérico del servicio, ej. `/api/envio/1`)*

#### Encabezados (Headers)
| Clave | Valor | Requerido |
|-------|-------|:---------:|
| `Authorization` | `Bearer <token_admin>` | Sí |
| `Content-Type` | `application/json` | Sí |

#### Cuerpo de la solicitud (Body)
```json
{
    "servicioExpress": true
}
```

#### Campos del Body
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `servicioExpress` | boolean | Nuevo estado de la modalidad express del servicio. |

---

## 💡 Guía rápida de uso en Insomnia

1. Abra **Insomnia** y cree una nueva solicitud (*Create Request*).
2. Seleccione el método HTTP (`POST` o `PATCH`) según la operación que desee realizar.
3. Ingrese la URL completa de su entorno (ej. `http://localhost:3000/api/envio` o la URL de producción).
4. Vaya a la pestaña **Headers** y agregue:
   - Name: `Authorization`
   - Value: `Bearer <tu_token_admin_real>`
5. Vaya a la pestaña **Body**, seleccione el formato `JSON` y pegue el cuerpo de la solicitud correspondiente.
6. Haga clic en el botón **Send** para ejecutar la petición y verifique la respuesta en el panel inferior.