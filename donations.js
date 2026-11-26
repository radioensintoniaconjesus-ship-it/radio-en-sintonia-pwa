"use strict";

const DONATION_NUMBER = "3136596423";
const DONATION_URL = "https://ensintoniaconjesus.odoo.com/donaciones";
const DONATION_WHATSAPP = "573148868527";
const DONATION_WHATSAPP_MESSAGE = "Quiero más información para donar a En Sintonía con Jesús";
const donationDialog = document.querySelector("#donationDialog");

// Keep the official payment page in one canonical place, as in Android 1.26.
const donationPageLink = document.querySelector("#donationPageLink");
if (donationPageLink) donationPageLink.href = DONATION_URL;

function openDonationView() {
  setView("donateView");
}

document.querySelector("#homeDonate").addEventListener("click", openDonationView);
document.querySelector("#moreDonate").addEventListener("click", openDonationView);
document.querySelector("#moreNews").addEventListener("click", () => setView("newsView"));

document.querySelectorAll(".payment-chip").forEach(button => {
  button.addEventListener("click", () => copyDonationNumber(button.dataset.copyLabel || "Número de donación"));
});
document.querySelector("#copyDonationNumber").addEventListener("click", () => copyDonationNumber("Número de donación"));
document.querySelector("#donationWhatsapp").addEventListener("click", () => {
  if (typeof donationDialog.showModal === "function") donationDialog.showModal();
  else showToast("Para más información, escríbenos por WhatsApp.");
});
document.querySelector("#closeDonationDialog").addEventListener("click", () => donationDialog.close());
document.querySelector("#cancelDonationDialog").addEventListener("click", () => donationDialog.close());
document.querySelector("#openDonationWhatsApp").addEventListener("click", () => {
  const url = "https://wa.me/" + DONATION_WHATSAPP + "?text=" + encodeURIComponent(DONATION_WHATSAPP_MESSAGE);
  window.location.href = url;
});

async function copyDonationNumber(label) {
  let copied = false;
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(DONATION_NUMBER);
      copied = true;
    } catch (_) {}
  }
  if (!copied) {
    const field = document.createElement("textarea");
    field.value = DONATION_NUMBER;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    field.style.pointerEvents = "none";
    document.body.append(field);
    field.focus();
    field.select();
    field.setSelectionRange(0, field.value.length);
    try { copied = document.execCommand("copy"); } catch (_) { copied = false; }
    field.remove();
  }
  if (copied) showToast("Copiado: " + DONATION_NUMBER);
  else showToast("No fue posible copiarlo. Selecciona el número " + DONATION_NUMBER);
}
