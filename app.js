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
