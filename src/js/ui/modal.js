/**
 * Sistema Modali (<dialog> accessibile) e Toast non-bloccante.
 * Sostituisce al 100% window.alert, window.confirm e window.prompt.
 */

import { esc } from "../formatters.js";

let _toastTimer = null;

export function showToast(message, { type = "info", duration = 3200 } = {}) {
  const el = document.getElementById("app-toast");
  if (!el) return;
  el.textContent = String(message || "");
  el.dataset.type = type;
  el.classList.add("visible");
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => {
    el.classList.remove("visible");
  }, duration);
}

function getDialogEl() {
  let dialog = document.getElementById("app-modal-dialog");
  if (!dialog) {
    dialog = document.createElement("dialog");
    dialog.id = "app-modal-dialog";
    dialog.className = "app-modal";
    document.body.appendChild(dialog);
  }
  return dialog;
}

/**
 * Apre una modale personalizzata con contenuto HTML/DOM e pulsanti d'azione.
 * Restituisce una Promise risolta col valore del pulsante cliccato (o null se chiusa con ESC/backdrop).
 */
export function openModal({
  title = "",
  subtitle = "",
  bodyHtml = "",
  buttons = [{ label: "Chiudi", value: true, variant: "primary" }],
  size = "md", // 'sm' | 'md' | 'lg'
  onMount = null,
}) {
  return new Promise((resolve) => {
    const dialog = getDialogEl();
    dialog.dataset.size = size;

    const btnHtml = buttons
      .map(
        (b, idx) =>
          `<button type="button" class="btn btn-${esc(b.variant || "ghost")}" data-modal-idx="${idx}">${esc(b.label)}</button>`
      )
      .join("");

    dialog.innerHTML = `
      <div class="modal-shell">
        <header class="modal-header">
          <div class="modal-title-group">
            <h3 class="modal-title">${esc(title)}</h3>
            ${subtitle ? `<p class="modal-subtitle">${esc(subtitle)}</p>` : ""}
          </div>
          <button type="button" class="icon-btn modal-close-x" aria-label="Chiudi finestra" data-modal-close>✕</button>
        </header>
        <div class="modal-body">${bodyHtml}</div>
        ${buttons.length ? `<footer class="modal-footer">${btnHtml}</footer>` : ""}
      </div>
    `;

    let settled = false;
    const finish = (val) => {
      if (settled) return;
      settled = true;
      dialog.removeEventListener("cancel", onCancel);
      dialog.removeEventListener("click", onClick);
      if (dialog.open) dialog.close();
      resolve(val);
    };

    const onCancel = (e) => {
      e.preventDefault();
      finish(null);
    };

    const onClick = async (e) => {
      if (e.target === dialog) {
        finish(null);
        return;
      }
      if (e.target.closest("[data-modal-close]")) {
        finish(null);
        return;
      }
      const btn = e.target.closest("[data-modal-idx]");
      if (btn) {
        const idx = Number(btn.dataset.modalIdx);
        const cfg = buttons[idx];
        if (!cfg) return;
        if (typeof cfg.onClick === "function") {
          const result = await cfg.onClick(dialog);
          if (result === false) return; // Permette validazione form dentro modale
          finish(result !== undefined ? result : cfg.value);
        } else {
          finish(cfg.value);
        }
      }
    };

    dialog.addEventListener("cancel", onCancel);
    dialog.addEventListener("click", onClick);

    if (typeof onMount === "function") {
      onMount(dialog, finish);
    }

    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
  });
}

export function alertModal(title, message) {
  return openModal({
    title,
    bodyHtml: `<p class="modal-text">${esc(message)}</p>`,
    buttons: [{ label: "Ho capito", value: true, variant: "primary" }],
    size: "sm",
  });
}

export function confirmModal({
  title = "Conferma operazione",
  message = "",
  confirmLabel = "Conferma",
  cancelLabel = "Annulla",
  danger = false,
}) {
  return openModal({
    title,
    bodyHtml: `<p class="modal-text">${esc(message)}</p>`,
    buttons: [
      { label: cancelLabel, value: false, variant: "ghost" },
      { label: confirmLabel, value: true, variant: danger ? "danger" : "primary" },
    ],
    size: "sm",
  }).then((res) => res === true);
}

export function choiceModal({ title, message, choices = [] }) {
  return openModal({
    title,
    bodyHtml: `<p class="modal-text">${esc(message)}</p>`,
    buttons: choices,
    size: "md",
  });
}
