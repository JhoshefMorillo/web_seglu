/* ============================================
   CATÁLOGO DE PRODUCTOS — Datos editables
   ============================================
   Este archivo solo contiene DATOS, no lógica.
   Edita/añade productos aquí con total libertad:
   los filtros, la búsqueda, la modal de producto
   y el carrito se actualizan solos.

   Cómo agregar un producto:
     { id, name, marca, categoria, image,
       tallas?, resaltado?, descripcion, detalles }

   - id: texto único por producto (no se repita).
   - name: nombre visible del producto.
   - marca: DEBE coincidir con un valor de MARCAS.
   - categoria: DEBE coincidir con un slug de CATEGORIAS.
   - image (opcional): ruta de la foto. Si no existe,
            se usa el ícono de su categoría.
   - tallas (opcional): opciones del producto.
   - resaltado (opcional): badge "Nuevo", "Oferta"...
   - descripcion: texto breve que se muestra en la modal.
   - detalles: lista de especificaciones / normas.
*/

// Categorías (el slug viaja en las URLs ?cat= del footer)
const CATEGORIAS = [
  { slug: "todos", nombre: "Todos los productos" },
  { slug: "calzado", nombre: "Calzado de Seguridad" },
  { slug: "corporal", nombre: "Protección Corporal" },
  { slug: "cabeza", nombre: "Protección de la Cabeza" },
  { slug: "visual", nombre: "Protección Visual" },
  { slug: "respiratoria", nombre: "Protección Respiratoria" },
  { slug: "auditiva", nombre: "Protección Auditiva" },
  { slug: "manos", nombre: "Protección de Manos" },
  { slug: "alturas", nombre: "Seguridad en Alturas" },
];

// Marcas (los íconos del marquee del inicio + las que vendas)
const MARCAS = [
  "3M",
  "Honeywell",
  "UVEX",
  "Delta Plus",
  "Protector",
  "Ansell",
  "MAPRO",
  "Truper",
];

// Íconos por categoría (usa las mismas imágenes del inicio)
const ICONO_POR_SLUG = {
  calzado: "assets/img/categorias/calzado.png",
  corporal: "assets/img/categorias/corporal.png",
  cabeza: "assets/img/categorias/cabeza.png",
  visual: "assets/img/categorias/visual.png",
  respiratoria: "assets/img/categorias/respiratoria.png",
  auditiva: "assets/img/categorias/auditiva.png",
  manos: "assets/img/categorias/manos.png",
  alturas: "assets/img/categorias/alturas.png",
};

// Productos (datos de ejemplo — reemplaza con tu catálogo real)
const PRODUCTOS = [
  {
    id: "botin-3m",
    name: "Botín de seguridad con puntera de acero",
    marca: "3M",
    categoria: "calzado",
    tallas: ["38", "39", "40", "41", "42"],
    descripcion:
      "Botín de seguridad para trabajos de construcción e industria, con puntera de acero y planta antideslizante.",
    detalles: [
      "Puntera de acero (200 joul)",
      "Planta de cuero bona",
      "Suela antideslizante",
      "Norma UNE-EN 20345",
    ],
  },
  {
    id: "bota-dielectrica",
    name: "Bota dieléctrica marca Protector",
    marca: "Protector",
    categoria: "calzado",
    tallas: ["39", "40", "41", "42", "43"],
    descripcion:
      "Bota dieléctrica sin partes metálicas, diseñada para trabajos con riesgo eléctrico.",
    detalles: [
      "Clasificación 0 (1000 V)",
      "Sin partes metálicas",
      "Suela aislante",
      "Antideslizante",
    ],
  },
  {
    id: "lentes-clear",
    name: "Lente de seguridad antiempaño",
    marca: "3M",
    categoria: "visual",
    descripcion:
      "Lente de seguridad ligero con tratamiento antiempaño y protección UV, ideal para uso diario.",
    detalles: [
      "Lente de policarbonato",
      "Protección UV400",
      "Tratamiento antiempaño",
      "Peso ligero: 30 g",
    ],
  },
  {
    id: "lentes-uv",
    name: "Gafas protección UV clase óptica 1",
    marca: "UVEX",
    categoria: "visual",
    descripcion:
      "Gafas de protección con clase óptica 1 y campo de visión amplio.",
    detalles: [
      "Clase óptica 1 (máx. claridad)",
      "Protección UV",
      "Patillas ajustables",
      "Tratamiento antirayaduras",
    ],
  },
  {
    id: "casco-clase-c",
    name: "Casco clase C con barbiquejo",
    marca: "Honeywell",
    categoria: "cabeza",
    descripcion:
      "Casco industrial clase C con barbiquejo cervical de 4 puntos de apoyo.",
    detalles: [
      "Nivel C sin dielectricidad",
      "Barbiquejo cervical incluido",
      "Norma ANSI Z89.1",
      "Colores disponibles",
    ],
  },
  {
    id: "arnes-5puntos",
    name: "Arnés de seguridad 5 puntos sin costuras",
    marca: "Delta Plus",
    categoria: "alturas",
    tallas: ["S", "M", "L", "XL"],
    descripcion:
      "Arnés de cuerpo completo de 5 puntos, tejido sin costuras para mayor comodidad en jornadas largas.",
    detalles: [
      "5 puntos de anclaje",
      "Tejido sin costuras",
      "Fácil ajuste por talla",
      "Certificado de uso en altura",
    ],
  },
  {
    id: "linea-vida",
    name: "Línea de vida horizontal 30 m",
    marca: "Delta Plus",
    categoria: "alturas",
    tallas: ["30 m"],
    descripcion:
      "Línea de vida horizontal de 30 metros con anclajes deslizantes, para equipos de trabajo en altura.",
    detalles: [
      "Longitud: 30 m",
      "Capacidad: 100 kg",
      "Material poliéster",
      "Anclajes deslizantes",
    ],
  },
  {
    id: "tapones-espuma",
    name: "Tapones auditivos espuma (100 u.)",
    marca: "3M",
    categoria: "auditiva",
    descripcion:
      "Caja de 100 tapones auditivos de espuma de baja presión, de un solo uso.",
    detalles: [
      "Reducción SNR 37 dB",
      "Espuma de baja presión",
      "Uso descartable",
      "Presentación: caja x100",
    ],
  },
  {
    id: "orejeras",
    name: "Orejeras de copa con diadema",
    marca: "UVEX",
    categoria: "auditiva",
    descripcion:
      "Orejeras de copa con diadema ajustable para protección auditiva en ambientes ruidosos.",
    detalles: [
      "Reducción SNR 32 dB",
      "Diadema forrada",
      "Cojines viscoelásticos",
      "Ligeras y ajustables",
    ],
  },
  {
    id: "respirador-n95",
    name: "Respirador N95 con válvula",
    marca: "3M",
    categoria: "respiratoria",
    descripcion:
      "Respirador N95 con válvula de exhalación para polvo y partículas contaminantes.",
    detalles: [
      "Filtración ≥ 95 %",
      "Con válvula de exhalación",
      "Clip nasal ajustable",
      "Uso individual",
    ],
  },
  {
    id: "careta-soldador",
    name: "Careta para soldador, lente fijo",
    marca: "Honeywell",
    categoria: "respiratoria",
    descripcion:
      "Careta de soldador con lente fijo oscuro y protector de policarbonato.",
    detalles: [
      "Lente fijo",
      "Protección policarbonato",
      "Clip porta-lente",
      "Diadema ajustable",
    ],
  },
  {
    id: "guantes-nitrile",
    name: "Guantes de nitrilo industrial (caja)",
    marca: "Ansell",
    categoria: "manos",
    tallas: ["S", "M", "L"],
    descripcion:
      "Guantes de nitrilo negro para uso industrial, caja de 100 unidades.",
    detalles: [
      "Material: nitrilo",
      "Uso industrial",
      "Presentación: caja x100",
      "Resistencia a químicos leves",
    ],
  },
  {
    id: "guantes-antivibracion",
    name: "Guantes antivibración acabado PVC",
    marca: "MAPRO",
    categoria: "manos",
    tallas: ["S", "M", "L", "XL"],
    descripcion:
      "Guantes antivibración con palma de gel y acabado PVC, para trabajos con herramientas vibrantes.",
    detalles: [
      "Palma con gel antivibración",
      "Talón de PVC",
      "Dorso transpirable",
      "Uso con herramientas vibrantes",
    ],
  },
  {
    id: "traje-tyvek",
    name: "Traje Tyvek desechable cierre D4",
    marca: "3M",
    categoria: "corporal",
    tallas: ["M", "L", "XL", "2XL"],
    descripcion:
      "Traje desechable Tyvek con capucha y cierre D4, para protección contra partículas.",
    detalles: [
      "Protección tipo 5 / 6",
      "Cierre D4 (sin velcro)",
      "Capucha y puños elásticos",
      "Material Tyvek",
    ],
  },
  {
    id: "chaleco-reflectivo",
    name: "Chaleco reflectivo clase 2 naranja",
    marca: "Protector",
    categoria: "corporal",
    tallas: ["S", "M", "L", "XL"],
    descripcion:
      "Chaleco de alta visibilidad clase 2 con cintas reflectivas de 5 cm.",
    detalles: [
      "Clase 2",
      "Cinta reflectiva 5 cm",
      "Cierre frontal",
      "Color naranja / amarillo",
    ],
  },
  {
    id: "cinturon-herramientas",
    name: "Cinturón portaherramientas con tirantes",
    marca: "Truper",
    categoria: "alturas",
    descripcion:
      "Cinturón con tirantes ajustables para cargar herramientas en trabajos en altura.",
    detalles: [
      "Capacidad de carga 10 kg",
      "Tirantes ajustables",
      "Hebilla metálica",
      "Refuerzos en costuras",
    ],
  },
  {
    id: "guantes-carnaza",
    name: "Guante de carnaza con chuletero",
    marca: "MAPRO",
    categoria: "manos",
    tallas: ["S", "M", "L"],
    descripcion:
      "Guante de carnaza flor con chuletero, resistente a calor moderado y fricción.",
    detalles: [
      "Carnaza flor",
      "Chuletero incorporado",
      "Resistente a fricción",
      "Uso con calor moderado",
    ],
  },
];