"use strict";

const STREAM_URL = "https://stream.zeno.fm/aaxmu6s8rrhvv";
const BLOG_URL = "https://radioensintoniaconjesus.blogspot.com/";
const BLOG_FEED = "https://radioensintoniaconjesus.blogspot.com/feeds/posts/default?alt=json-in-script&max-results=5&callback=ensintoniaBloggerFeed";
const audio = document.querySelector("#radioAudio");
const statusText = document.querySelector("#streamStatus");
const playButton = document.querySelector("#playButton");
const toggleButton = document.querySelector("#toggleButton");
const reloadButton = document.querySelector("#reloadButton");
const volumeInput = document.querySelector("#volume");
const volumeValue = document.querySelector("#volumeValue");
const muteButton = document.querySelector("#muteButton");
const toast = document.querySelector("#toast");
const installDialog = document.querySelector("#installDialog");
const verseSlot = document.querySelector("#verseSlot");
const verseReference = document.querySelector("#verseReference");
const verseText = document.querySelector("#verseText");
const reflectionText = document.querySelector("#reflectionText");
const verseSource = document.querySelector("#verseSource");
let currentDailyVerse = null;

// This list and the morning/noon rotation are ported from Android 1.26.
const DAILY_VERSES = [
  {reference:"Efesios 4:5-6", text:"Un Señor, una fe, un bautismo, un Dios y Padre de todos, el cual es sobre todos, y por todos, y en todos.", reflection:"La iglesia del Señor camina firme cuando recuerda que hay un solo Dios, una sola fe y un solo bautismo. Permanece unido a Cristo y vive con identidad apostólica."},
  {reference:"Marcos 16:15-16", text:"Id por todo el mundo y predicad el evangelio a toda criatura. El que creyere y fuere bautizado, será salvo; mas el que no creyere, será condenado.", reflection:"La salvación se anuncia con poder: fe en Jesucristo, arrepentimiento y obediencia al evangelio. Hoy es un buen día para responder al llamado del Señor."},
  {reference:"Hechos 2:38", text:"Pedro les dice: Arrepentíos, y bautícese cada uno de vosotros en el nombre de Jesucristo para perdón de los pecados; y recibiréis el don del Espíritu Santo.", reflection:"La salvación se anuncia con poder: fe en Jesucristo, arrepentimiento y obediencia al evangelio. Hoy es un buen día para responder al llamado del Señor."},
  {reference:"Juan 14:6", text:"Jesús le dice: Yo soy el camino, y la verdad, y la vida; nadie viene al Padre, sino por mí.", reflection:"La fe verdadera mira más allá de la circunstancia y descansa en las promesas de Dios. Confía en el Señor Jesús; Él sigue obrando a favor de su pueblo."},
  {reference:"Salmos 46:1", text:"Dios es nuestro amparo y fortaleza, nuestro pronto auxilio en las tribulaciones.", reflection:"Aun en medio de las dificultades, el Señor permanece fiel. Levanta tus ojos, fortalece tu esperanza y sigue adelante confiando en su cuidado."},
  {reference:"Filipenses 4:6-7", text:"Por nada estéis afanosos; sino sean notorias vuestras peticiones delante de Dios en toda oración y ruego, con hacimiento de gracias. Y la paz de Dios guardará vuestros corazones y vuestros entendimientos en Cristo Jesús.", reflection:"Cuando oramos con sinceridad, el Señor fortalece el alma y trae dirección. Presenta tus cargas delante de Dios y descansa en su respuesta."},
  {reference:"Romanos 8:28", text:"Sabemos que a los que a Dios aman, todas las cosas les ayudan a bien.", reflection:"Aun en medio de las dificultades, el Señor permanece fiel. Levanta tus ojos, fortalece tu esperanza y sigue adelante confiando en su cuidado."},
  {reference:"Isaías 41:10", text:"No temas, porque yo soy contigo; no desmayes, porque yo soy tu Dios que te esfuerzo.", reflection:"Aun en medio de las dificultades, el Señor permanece fiel. Levanta tus ojos, fortalece tu esperanza y sigue adelante confiando en su cuidado."},
  {reference:"Juan 3:16", text:"Porque de tal manera amó Dios al mundo, que ha dado á su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.", reflection:"La salvación se anuncia con poder: fe en Jesucristo, arrepentimiento y obediencia al evangelio. Hoy es un buen día para responder al llamado del Señor."},
  {reference:"1 Pedro 5:7", text:"Echando toda vuestra ansiedad sobre él, porque él tiene cuidado de vosotros.", reflection:"Aun en medio de las dificultades, el Señor permanece fiel. Levanta tus ojos, fortalece tu esperanza y sigue adelante confiando en su cuidado."},
  {reference:"Hebreos 11:6", text:"Sin fe es imposible agradar á Dios; porque es menester que el que a Dios se allega, crea que le hay, y que es galardonador de los que le buscan.", reflection:"La fe verdadera mira más allá de la circunstancia y descansa en las promesas de Dios. Confía en el Señor Jesús; Él sigue obrando a favor de su pueblo."},
  {reference:"Colosenses 3:16", text:"La palabra de Cristo habite en vosotros en abundancia; enseñándoos y exhortándoos unos á otros con salmos é himnos y canciones espirituales, con gracia cantando en vuestros corazones al Señor.", reflection:"La adoración genuina exalta al Señor Jesús y renueva el espíritu. Dedica este día a adorar con gozo, reverencia y gratitud."},
  {reference:"Salmos 100:2", text:"Servid a Jehová con alegría; venid ante su acatamiento con regocijo.", reflection:"La adoración genuina exalta al Señor Jesús y renueva el espíritu. Dedica este día a adorar con gozo, reverencia y gratitud."},
  {reference:"Proverbios 3:5-6", text:"Fíate de Jehová de todo tu corazón, y no estribes en tu prudencia. Reconócelo en todos tus caminos, y él enderezará tus veredas.", reflection:"La fe verdadera mira más allá de la circunstancia y descansa en las promesas de Dios. Confía en el Señor Jesús; Él sigue obrando a favor de su pueblo."},
  {reference:"Mateo 11:28", text:"Venid á mí todos los que estáis trabajados y cargados, que yo os haré descansar.", reflection:"Aun en medio de las dificultades, el Señor permanece fiel. Levanta tus ojos, fortalece tu esperanza y sigue adelante confiando en su cuidado."},
  {reference:"Josué 1:9", text:"Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes, porque Jehová tu Dios será contigo.", reflection:"Aun en medio de las dificultades, el Señor permanece fiel. Levanta tus ojos, fortalece tu esperanza y sigue adelante confiando en su cuidado."},
  {reference:"Romanos 10:9", text:"Que si confesares con tu boca al Señor Jesús, y creyeres en tu corazón que Dios le levantó de los muertos, serás salvo.", reflection:"La salvación se anuncia con poder: fe en Jesucristo, arrepentimiento y obediencia al evangelio. Hoy es un buen día para responder al llamado del Señor."},
  {reference:"Gálatas 5:22-23", text:"El fruto del Espíritu es amor, gozo, paz, paciencia, benignidad, bondad, fe, mansedumbre, templanza.", reflection:"Dios nos llama a una vida transformada. Permite que el Espíritu Santo produzca fruto en ti y te aparte para agradar al Señor en todo."},
  {reference:"Santiago 1:5", text:"Y si alguno de vosotros tiene falta de sabiduría, demándela á Dios, el cual da a todos abundantemente, y no zahiere; y le será dada.", reflection:"Cuando oramos con sinceridad, el Señor fortalece el alma y trae dirección. Presenta tus cargas delante de Dios y descansa en su respuesta."},
  {reference:"2 Timoteo 1:7", text:"Porque no nos ha dado Dios el espíritu de temor, sino el de fortaleza, y de amor, y de templanza.", reflection:"Aun en medio de las dificultades, el Señor permanece fiel. Levanta tus ojos, fortalece tu esperanza y sigue adelante confiando en su cuidado."},
  {reference:"Salmos 119:105", text:"Lámpara es á mis pies tu palabra, y lumbrera á mi camino.", reflection:"La Palabra de Dios ilumina el camino y corrige el corazón. Permite que la Escritura guíe tus decisiones y sostenga tu comunión con el Señor."},
  {reference:"Romanos 12:2", text:"No os conforméis á este siglo; mas reformaos por la renovación de vuestro entendimiento, para que experimentéis cuál sea la buena voluntad de Dios.", reflection:"Dios nos llama a una vida transformada. Permite que el Espíritu Santo produzca fruto en ti y te aparte para agradar al Señor en todo."},
  {reference:"Hechos 4:12", text:"Y en ningún otro hay salud; porque no hay otro nombre debajo del cielo, dado á los hombres, en que podamos ser salvos.", reflection:"El nombre de Jesús es suficiente para salvar, sanar y dar esperanza. Aférrate a Él con fe, porque en su nombre hay vida y victoria."},
  {reference:"Juan 4:24", text:"Dios es Espíritu; y los que le adoran, en espíritu y en verdad es necesario que adoren.", reflection:"La adoración genuina exalta al Señor Jesús y renueva el espíritu. Dedica este día a adorar con gozo, reverencia y gratitud."}
];

function getDailyVerse() {
  const slot = new Date().getHours() >= 12 ? 1 : 0;
  const day = Math.floor(Date.now() / 86400000);
  const index = ((day * 2 + slot) % DAILY_VERSES.length + DAILY_VERSES.length) % DAILY_VERSES.length;
  return {
    ...DAILY_VERSES[index],
    slotLabel: slot === 0 ? "VERSÍCULO DE LA MAÑANA" : "VERSÍCULO DEL MEDIODÍA",
    sourceName: "Lectura diaria integrada en la aplicación"
  };
}

function renderDailyVerse() {
  currentDailyVerse = getDailyVerse();
  verseSlot.textContent = currentDailyVerse.slotLabel;
  verseReference.textContent = currentDailyVerse.reference;
  verseText.textContent = `“${currentDailyVerse.text}”`;
  reflectionText.textContent = currentDailyVerse.reflection;
  verseSource.textContent = currentDailyVerse.sourceName;
}

function buildDailyVerseShareMessage() {
  if (!currentDailyVerse) return "";
  return "📖 VERSÍCULO DEL DÍA\n"
    + currentDailyVerse.reference + "\n“" + currentDailyVerse.text + "”\n\n"
    + "🙏 REFLEXIÓN\n" + currentDailyVerse.reflection + "\n\n"
    + "Que esta palabra fortalezca tu fe y te acompañe durante el día.\n\n"
    + "📻 Sigue en sintonía con Jesús — Radio con Identidad. Comparte este mensaje y escucha nuestra programación donde estés.\n\n"
    + "📲 Escucha la emisora e instala la aplicación: \n" + location.href + "\n\n"
    + "Sonando al corazón de Dios.";
}

async function shareDailyVerse() {
  if (!currentDailyVerse) renderDailyVerse();
  const message = buildDailyVerseShareMessage();
  const shareData = {title:"Versículo y reflexión | En Sintonía con Jesús", text:message};
  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (error) {
      if (error && error.name !== "AbortError") showToast("No fue posible abrir las opciones para compartir.");
    }
    return;
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(message);
      showToast("Versículo y reflexión copiados. Ya puedes compartirlos.");
      return;
    } catch (_) {}
  }
  const whatsappUrl = "https://wa.me/?text=" + encodeURIComponent(message);
  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
}

document.querySelectorAll(".current-year").forEach(el => el.textContent = new Date().getFullYear());

let deferredInstallPrompt = null;
let previousVolume = 85;
let toastTimer = null;
let feedLoaded = false;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function setView(viewId) {
  document.querySelectorAll(".view").forEach(view => view.classList.toggle("active", view.id === viewId));
  document.querySelectorAll(".nav-item").forEach(button => {
    const active = button.dataset.view === viewId;
    button.classList.toggle("active", active);
    if (active) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  window.scrollTo({top: 0, behavior: "smooth"});
  if (viewId === "newsView" && !feedLoaded) loadNews();
  if (viewId === "verseView") renderDailyVerse();
}

document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => setView(button.dataset.view));
});
document.querySelector("#headerNews").addEventListener("click", () => setView("newsView"));
document.querySelector("#listenNow").addEventListener("click", async () => {
  setView("radioView");
  await startRadio();
});

function setPlaybackUi(playing, message) {
  playButton.textContent = playing ? "Ⅱ" : "▶";
  playButton.setAttribute("aria-label", playing ? "Pausar" : "Reproducir");
  toggleButton.textContent = playing ? "Ⅱ PAUSAR" : "▶ REPRODUCIR";
  if (message) statusText.textContent = message;
}

async function startRadio() {
  if (!audio.src) {
    audio.src = STREAM_URL;
    audio.load();
  }
  statusText.textContent = "Conectando con la señal de la emisora…";
  try {
    await audio.play();
    setPlaybackUi(true, "Estás escuchando En Sintonía con Jesús.");
    if ("mediaSession" in navigator) {
      try {
        navigator.mediaSession.playbackState = "playing";
      } catch (_) {}
    }
  } catch (_) {
    setPlaybackUi(false, "No se pudo iniciar. Revisa tu conexión e inténtalo de nuevo.");
  }
}

function pauseRadio() {
  audio.pause();
  setPlaybackUi(false, "Reproducción pausada.");
  if ("mediaSession" in navigator) {
    try {
      navigator.mediaSession.playbackState = "paused";
    } catch (_) {}
  }
}

async function toggleRadio() {
  if (audio.paused) await startRadio();
  else pauseRadio();
}

async function reloadRadio() {
  statusText.textContent = "Actualizando la señal de la emisora…";
  audio.pause();
  audio.removeAttribute("src");
  audio.load();
  audio.src = STREAM_URL;
  audio.load();
  await startRadio();
}

playButton.addEventListener("click", toggleRadio);
toggleButton.addEventListener("click", toggleRadio);
reloadButton.addEventListener("click", reloadRadio);
audio.addEventListener("playing", () => setPlaybackUi(true, "Estás escuchando En Sintonía con Jesús."));
audio.addEventListener("pause", () => {
  if (audio.currentTime === 0 && !audio.src) return;
  setPlaybackUi(false, "Reproducción pausada.");
});
audio.addEventListener("waiting", () => { statusText.textContent = "Conectando…"; });
audio.addEventListener("error", () => setPlaybackUi(false, "No fue posible recibir la señal. Comprueba internet o recarga la transmisión."));

function applyVolume(value) {
  const numeric = Math.max(0, Math.min(100, Number(value)));
  audio.volume = numeric / 100;
  volumeValue.value = numeric + "%";
  volumeValue.textContent = numeric + "%";
  if (numeric > 0) previousVolume = numeric;
  muteButton.textContent = numeric === 0 ? "ACTIVAR" : "SILENCIO";
}
volumeInput.addEventListener("input", event => applyVolume(event.target.value));
muteButton.addEventListener("click", () => {
  const current = Number(volumeInput.value);
  const next = current > 0 ? 0 : Math.max(5, previousVolume);
  volumeInput.value = String(next);
  applyVolume(next);
});
applyVolume(volumeInput.value);

if ("mediaSession" in navigator && "MediaMetadata" in window) {
  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: "En Sintonía con Jesús",
      artist: "Radio con Identidad",
      album: "Sonando al corazón de Dios",
      artwork: [
        {src: "./icons/icon-192.png", sizes: "192x192", type: "image/png"},
        {src: "./icons/icon-512.png", sizes: "512x512", type: "image/png"}
      ]
    });
    navigator.mediaSession.setActionHandler("play", startRadio);
    navigator.mediaSession.setActionHandler("pause", pauseRadio);
  } catch (_) {}
}

function safePostUrl(entry) {
  const links = Array.isArray(entry.link) ? entry.link : [];
  const alternate = links.find(link => link.rel === "alternate" && link.href);
  try {
    const url = new URL(alternate ? alternate.href : BLOG_URL);
    return url.protocol === "https:" ? url.href : BLOG_URL;
  } catch (_) {
    return BLOG_URL;
  }
}

function renderNews(data) {
  const list = document.querySelector("#newsList");
  const entries = data && data.feed && Array.isArray(data.feed.entry) ? data.feed.entry.slice(0, 5) : [];
  list.replaceChildren();
  feedLoaded = true;

  if (!entries.length) {
    const card = document.createElement("article");
    card.className = "card news-card";
    const p = document.createElement("p");
    p.textContent = "No hay publicaciones disponibles en este momento. Puedes consultar el blog completo.";
    card.append(p);
    list.append(card);
    return;
  }

  for (const entry of entries) {
    const card = document.createElement("article");
    card.className = "card news-card";
    const date = document.createElement("time");
    const published = entry.published && entry.published.$t ? new Date(entry.published.$t) : null;
    date.textContent = published && !Number.isNaN(published.getTime())
      ? new Intl.DateTimeFormat("es-CO", {day:"numeric", month:"short", year:"numeric"}).format(published)
      : "En nuestro blog";
    const link = document.createElement("a");
    link.href = safePostUrl(entry);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = entry.title && entry.title.$t ? entry.title.$t.trim() : "Publicación de En Sintonía";
    const summary = document.createElement("p");
    const raw = entry.summary && entry.summary.$t ? entry.summary.$t : "";
    summary.textContent = raw.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 150);
    card.append(date, link);
    if (summary.textContent) card.append(summary);
    list.append(card);
  }
}

function loadNews() {
  if (window.ensintoniaFeedLoading) return;
  window.ensintoniaFeedLoading = true;
  const script = document.createElement("script");
  script.src = BLOG_FEED;
  script.async = true;
  script.onerror = () => {
    window.ensintoniaFeedLoading = false;
    feedLoaded = true;
    const list = document.querySelector("#newsList");
    list.replaceChildren();
    const card = document.createElement("article");
    card.className = "card news-card";
    const p = document.createElement("p");
    p.textContent = "No fue posible consultar las publicaciones ahora. Puedes visitar el blog directamente.";
    card.append(p);
    list.append(card);
  };
  window.ensintoniaBloggerFeed = data => {
    window.ensintoniaFeedLoading = false;
    script.remove();
    renderNews(data);
  };
  document.body.append(script);
  window.setTimeout(() => {
    if (window.ensintoniaFeedLoading) script.onerror();
  }, 12000);
}
function isInstalled() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function showInstallGuide() {
  const ua = navigator.userAgent || "";
  const isIOS = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(ua);
  let instructions = "";
  if (isIOS) {
    instructions = "<ol><li>Abre esta página en <b>Safari</b>. No uses el navegador interno de WhatsApp o Facebook.</li><li>Toca el botón <b>Compartir</b> (cuadrado con flecha hacia arriba).</li><li>Desplázate y selecciona <b>Agregar a pantalla de inicio</b>.</li><li>Comprueba que el nombre sea <b>En Sintonía</b> y toca <b>Agregar</b>.</li></ol>";
  } else if (isAndroid) {
    instructions = "<ol><li>Abre esta página en <b>Chrome</b>.</li><li>Toca el menú de tres puntos (⋮).</li><li>Selecciona <b>Instalar aplicación</b> o <b>Agregar a pantalla principal</b>.</li><li>Confirma la instalación. El icono aparecerá junto a tus aplicaciones.</li></ol>";
  } else {
    instructions = "<ol><li>Abre esta página en un navegador compatible con aplicaciones web.</li><li>Busca <b>Instalar aplicación</b> o <b>Agregar a pantalla principal</b> en el menú del navegador.</li><li>Confirma la instalación.</li></ol>";
  }
  document.querySelector("#installSteps").innerHTML = instructions;
  if (typeof installDialog.showModal === "function") installDialog.showModal();
  else showToast("Abre el menú de tu navegador y selecciona Agregar a pantalla de inicio.");
}

async function installApp() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    try { await deferredInstallPrompt.userChoice; } catch (_) {}
    deferredInstallPrompt = null;
  } else {
    showInstallGuide();
  }
}
document.querySelector("#installButton").addEventListener("click", installApp);
document.querySelector("#howInstallHome").addEventListener("click", installApp);
document.querySelector("#howInstallMore").addEventListener("click", installApp);
document.querySelector("#closeInstall").addEventListener("click", () => installDialog.close());

window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  deferredInstallPrompt = event;
});
window.addEventListener("appinstalled", () => showToast("En Sintonía se instaló correctamente."));
if (isInstalled()) {
  const headerInstall = document.querySelector("#installButton");
  headerInstall.textContent = "Instalada";
  headerInstall.disabled = true;
  document.querySelectorAll("#howInstallHome").forEach(button => button.textContent = "APLICACIÓN INSTALADA");
}

document.querySelector("#shareVerseButton").addEventListener("click", shareDailyVerse);

document.querySelector("#shareLink").addEventListener("click", async event => {
  event.preventDefault();
  const shareData = {title:"En Sintonía con Jesús", text:"Escucha En Sintonía con Jesús — Radio con Identidad.", url:location.href};
  if (navigator.share) {
    try { await navigator.share(shareData); } catch (_) {}
  } else if (navigator.clipboard && navigator.clipboard.writeText) {
    try { await navigator.clipboard.writeText(location.href); showToast("Enlace copiado."); }
    catch (_) { showToast("Copia el enlace desde la barra del navegador."); }
  } else {
    showToast("Copia el enlace desde la barra del navegador.");
  }
});

if ("serviceWorker" in navigator && location.protocol === "https:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js", {scope:"./"}).catch(() => {});
  });
}

