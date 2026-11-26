# En Sintonía con Jesús — PWA

Aplicación web progresiva de **En Sintonía con Jesús — Radio con Identidad**, diseñada a partir de los recursos gráficos de la aplicación Android 1.26.

## Publicar con GitHub Pages

1. Abre el repositorio `radio-en-sintonia-pwa`.
2. Ve a **Settings → Pages**.
3. En **Build and deployment**, elige **Deploy from a branch**.
4. Selecciona `main` y la carpeta `/(root)`.
5. Guarda y espera la publicación.

URL prevista: https://radioensintoniaconjesus-ship-it.github.io/radio-en-sintonia-pwa/

## Instalar

- **iPhone/iPad:** abre la URL en Safari → Compartir → Agregar a pantalla de inicio → Agregar.
- **Android:** abre la URL en Chrome → menú ⋮ → Instalar aplicación o Agregar a pantalla principal.

No se distribuye un archivo IPA. Esta PWA se instala desde el navegador y no requiere membresía de Apple Developer Program.

## Funciones

- Reproducción manual del stream HTTPS de Zeno.fm.
- Controles de reproducir, pausar, recargar y volumen.
- Metadatos de reproducción del sistema cuando el navegador los admite.
- Versículo diario con rotación de mañana y mediodía, usando el contenido integrado de Android 1.26.
- Reflexión cristiana asociada a cada lectura.
- Compartir versículo y reflexión mediante el menú nativo del dispositivo, con copia al portapapeles o WhatsApp como alternativa.
- Novedades del feed público de Blogger al abrir la sección.
- Enlaces a la web oficial, donaciones y WhatsApp.
- Instalación guiada para iOS y Android.
- Caché local del shell de la aplicación para permitir abrir la interfaz sin conexión.

## Privacidad y límites

- No incorpora anuncios ni SDK publicitarios.
- No solicita GPS, contactos, cámara ni micrófono.
- Al reproducir, Zeno.fm recibe la conexión y datos técnicos, incluida la dirección IP; sus estadísticas pueden estimar una ubicación aproximada.
- La sección Novedades consulta el feed público de Blogger cuando se abre.
- Esta PWA no envía notificaciones automáticas. Las notificaciones silenciosas de Blogger siguen siendo una función de la aplicación Android.
- El audio y las publicaciones requieren internet. El service worker no almacena en caché el audio ni los recursos de terceros.

La reproducción en segundo plano y con pantalla bloqueada depende de las limitaciones del navegador y del sistema operativo, especialmente en iOS. Debe probarse en dispositivos reales.

