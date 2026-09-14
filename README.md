# Culto Café — web

Sitio estático (HTML/CSS/JS, sin build). Bilingüe ES / EN.

## Estructura
```
index.html              → español (raíz)
en/index.html           → inglés
sitemap.xml, robots.txt → SEO
assets/
  css/style.css
  js/data.js            → las 20 cafeterías (window.CULTO_CAFES) + textos EN
  js/main.js            → mapa, geolocalización, filtros, fichas
  vendor/leaflet.js/.css→ mapa (local, sin CDN ni API key)
  img/                  → fotos, mascotas, logo
  video/culto-historia.mp4 + poster.jpg  → la secuencia de los personajes
```

## Publicar
**Netlify**: arrastra la carpeta `culto-cafe-web` a *Add new site → Deploy manually*.
**WordPress autoalojado**: sube `assets/` por FTP y pega `index.html` en un bloque HTML personalizado (o dame una Application Password y lo monto por API).

Renombra el dominio en los `<link rel="canonical">` / `hreflang` / `sitemap.xml` (ahora `https://cultocafe.madrid/`) por el vuestro real.

## SEO ya incluido
- `<title>`, meta description y keywords por idioma (café de especialidad Madrid / specialty coffee Madrid).
- `hreflang` ES/EN + `x-default`, canonical, Open Graph, Twitter Card.
- Datos estructurados JSON-LD: `CollectionPage` + `ItemList` de 20 `CafeOrCoffeeShop` con dirección y coordenadas.
- `sitemap.xml` y `robots.txt`.

## Analítica y Pixel
En `index.html` y `en/index.html`, antes de `</head>`, pega los snippets de **GA4** y **Meta Pixel** (o Google Tag Manager). Funciona en cualquier hosting.

## Pendiente de vuestros datos
- **Logo**: `assets/img/logo.png` y `logo-slogan.png` están recortados del manual. Sustituir por export limpio (PNG transparente o SVG).
- **Fotos de cafeterías**: ahora son de stock (Unsplash, uso libre). El archivo de cada una está en el campo `foto` de `assets/js/data.js`.
- **Botón de Culto (WhatsApp)**: apunta a `#`. Cambiar por `https://wa.me/<número>`.
- **LinkedIn**: el enlace del footer es la página pública por id (`/company/146502917`). Cámbialo por la URL con nombre (`/company/culto-cafe/`) cuando la tengáis.
- **Precios**: orientativos; algunos estimados. Ajustar `desde` y `prref` en `data.js`.
- Páginas legales (Aviso legal / Privacidad / Cookies) están enlazadas pero vacías (`#`).

## El vídeo
`assets/video/culto-historia.mp4` — 29 s, 720p, generado con vuestras 15 imágenes de la carpeta *secuencia vídeo culto cafe* (zoom suave + transiciones encadenadas). Para regenerarlo o cambiar tiempos, hace falta reencodearlo; el resto de la web no depende de ello.
