# IMPORTSELU — Propuesta Web

Sitio web de **IMPORTSELU**, empresa peruana dedicada a la distribución y
comercialización de equipos de protección personal (EPPs) y seguridad
industrial.

## Estructura del proyecto

```
.
├── index.html                 # Página de inicio
├── productos.html             # Catálogo de productos (filtros, búsqueda, carrito)
├── nosotros.html              # Sobre la empresa
├── contacto.html              # Contacto (whatsapp, teléfono, correo, dirección, mapa)
├── politica-privacidad.html   # Política de privacidad
├── terminos-condiciones.html  # Términos y condiciones
├── assets/
│   ├── css/                   # Estilos (base, componentes, layout, carrito, search)
│   │   └── pages/             # Estilos por página (home, productos, nosotros, contacto, legal)
│   ├── js/
│   │   ├── config.js          # Configuración global (número de WhatsApp, correo)
│   │   ├── catalog.js         # Datos del catálogo (categorías, marcas, productos)
│   │   ├── main.js            # Interacciones globales
│   │   ├── search.js          # Buscador en vivo
│   │   ├── carrito.js         # Carrito lateral + envío por WhatsApp
│   │   ├── productos.js       # Lógica del catálogo
│   │   └── footer.js          # Inyección dinámica del footer único
│   ├── partials/
│   │   └── footer.html        # Plantilla única maestra del pie de página
│   ├── img/                   # Imágenes (logo, categorías, marcas, rubros, favicon)
│   └── video/                 # Videos del hero (1.mp4 ... 9.mp4)
└── README.md
```

## Configuración central

Todos los datos importantes (número de WhatsApp, correo) se centralizan en
`assets/js/config.js`. **Cambia ahí** el número de WhatsApp y el correo y se
actualizarán en todo el sitio.

```js
const WHATSAPP_NUMBER = "51906021455";
const EMAIL_CONTACTO = "ventas@importselu.com";
```

## Catálogo de productos

Los productos se editan en `assets/js/catalog.js`. Para agregar uno nuevo:

```js
{
  id: "nombre-unico",
  name: "Nombre visible del producto",
  marca: "3M",                 // debe coincidir con MARCAS
  categoria: "calzado",        // debe coincidir con un slug de CATEGORIAS
  image: "ruta/imagen.png",    // opcional (si no, usa ícono de categoría)
  tallas: ["S", "M", "L"],     // opcional
  resaltado: "Nuevo",          // opcional: "Nuevo", "Oferta", "Más vendido"
  descripcion: "Texto breve",
  detalles: ["Especificación 1", "Especificación 2"]
}
```

## Carrito

El carrito guarda los ítems en `localStorage` y arma un pedido que se envía por
WhatsApp (el precio se acuerda por ese canal). No requiere backend.

## Contacto y mapa
La página de `contacto.html` muestra tarjetas rápidas (WhatsApp, teléfono,
correo y dirección) y un mapa embebido con un filtro de color naranja
(Duotono). Para cambiar la dirección del mapa, edita el valor de `q=` en el
`<iframe>` de `contacto.html`.

## Desarrollo

Es un sitio estático (solo HTML, CSS y JS). No necesita build ni dependencias.
Abre los archivos `.html` directamente en el navegador.

### Notas de estilo y responsive

- El sitio es **mobile-first** y se adapta en `assets/css/*` y
  `assets/css/pages/*`.
- Respetan `prefers-reduced-motion` para accesibilidad.
- Usa scrollbar personalizado (ver `initCustomScrollbar` en `assets/js/main.js`).

© 2026 IMPORTSELU — Desarrollado y diseñado por Jhoshef Morillo.
