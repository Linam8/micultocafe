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

## Pasarela de pagos (para cafeterías)
La sección "Para cafeterías" tiene 4 planes — **Prueba gratuita** (0€/30 días), **Presencia** (15€/mes), **Destacada** (29€/mes) y **Socia** (49€/mes), cada uno con precio anual (2 meses gratis) — más el aviso de **Programa Pionero** (3 meses de Socia gratis para las cafeterías de Malasaña que se unan durante el lanzamiento).

**El recorrido completo es 100% funcional, de principio a fin:**
1. Se pulsa "Suscribirme"/"Empezar prueba" en un plan → lleva al **formulario de alta** (`/suscribir/` en ES, `/en/subscribe/` en EN), con el plan ya preseleccionado.
2. La cafetería rellena nombre del local, persona de contacto, email, teléfono y confirma el plan. **No se pide ningún dato de pago en este formulario.**
3. Al enviarlo, se navega a la **página de gracias** (`/gracias/?plan=...&nombre=...`), que confirma la solicitud con el nombre y el plan reales que se acaban de escribir, y explica los siguientes pasos.

**Lo que todavía no hace es cobrar de verdad ni guardar los datos en ningún sitio** — y eso es así a propósito: es un sitio estático sin servidor, así que el formulario no tiene dónde persistir la información todavía, y cobrar con tarjeta requiere una pasarela real (Stripe, Redsys...) conectada a una cuenta bancaria vuestra; ni yo ni este sitio estático debemos ni podemos procesar datos de tarjeta directamente. Para completarlo de verdad (gratis, sin tocar el diseño):
1. **Recibir los datos del formulario**: la forma más simple y gratis es un servicio como Formspree o Getform (les das la URL de tu cuenta gratuita y cambias la etiqueta `<form>` de `suscribir/index.html` y `en/subscribe/index.html` para que apunte ahí) — así cada alta os llega por email.
2. **Cobrar**: entra en `dashboard.stripe.com/payment-links` y crea un Payment Link por plan (con su precio mensual y anual). Configura como redirección tras el pago la página de gracias, por ejemplo `https://tudominio.com/gracias/?plan=Destacada`. Enlaza ese Payment Link desde el email de confirmación que le mandéis a la cafetería tras revisar su alta (no hace falta ponerlo en la propia web).

Así, cuando lo conectéis, el pago lo procesa Stripe (nunca esta web) y el cliente acaba igualmente en la página de gracias — el recorrido no cambia, solo se activa el cobro real en medio.

## Página de gracias
`/gracias/` (ES) y `/en/thank-you/` (EN): confirman la suscripción y explican los próximos pasos. `noindex` para que no salgan en buscadores.

## Pendiente de vuestros datos
- **Logo**: `assets/img/logo.png` y `logo-slogan.png` están recortados del manual. Sustituir por export limpio (PNG transparente o SVG).
- **Fotos de cafeterías**: reales, de las fichas de Google Business Profile de cada local (`assets/img/cafes/`). Una (Syra Coffee) usa una foto genérica de repuesto porque su URL de Google no cargó — pendiente de sustituir.
- **Botón de Culto (WhatsApp)**: apunta a `#`. Cambiar por `https://wa.me/<número>`.
- **LinkedIn**: el enlace del footer es la página pública por id (`/company/146502917`). Cámbialo por la URL con nombre (`/company/culto-cafe/`) cuando la tengáis.
- **Precios**: orientativos; algunos estimados. Ajustar `desde` y `prref` en `data.js`.
- Páginas legales (Aviso legal / Privacidad / Cookies) están enlazadas pero vacías (`#`).

## El vídeo
`assets/video/culto-historia.mp4` — 29 s, 720p, generado con vuestras 15 imágenes de la carpeta *secuencia vídeo culto cafe* (zoom suave + transiciones encadenadas). Para regenerarlo o cambiar tiempos, hace falta reencodearlo; el resto de la web no depende de ello.
