import { btn } from "./buttons.js";
import { render } from "../navigation.js";
import { state } from "../state.js";
import { STEAM } from "../data/links.js";

export function demoAction(msg) {
  state.modal = { type: "demo", msg };
  render();
}

export function confirmDelete(name) {
  state.modal = { type: "delete", name };
  render();
}

export function quitDemo() {
  demoAction("Quitter le jeu — action désactivée dans le prototype");
}

export function modalHTML() {
  const m = state.modal;
  let title = "",
    body = "",
    actions = "";
  if (m.type === "unsaved") {
    title = "MODIFICATIONS NON ENREGISTRÉES";
    body =
      "Des modifications n’ont pas été appliquées. Souhaitez-vous les enregistrer avant de quitter ?";
    actions =
      btn("APPLIQUER", "leaveOptions('apply')", "red") +
      btn("IGNORER", "leaveOptions('ignore')") +
      btn("ANNULER", "closeModal()");
  } else if (m.type === "reset") {
    title = "CONFIRMER LA RÉINITIALISATION";
    body =
      m.mode === "all"
        ? "Réinitialiser tous les paramètres ?"
        : "Réinitialiser les paramètres de cette catégorie ?";
    actions =
      btn("RÉINITIALISER", "resetConfirm()", "red") +
      btn("ANNULER", "closeModal()");
  } else if (m.type === "provider") {
    title = m.name;
    body =
      "Cette carte ouvrirait le site de l’hébergeur dans le navigateur. Les URL finales sont laissées au choix des développeurs.";
    actions = btn("FERMER", "closeModal()");
  } else if (m.type === "steam") {
    title = "PUBLICATION STEAM";
    body =
      "Dans le jeu, cette carte ouvrirait la publication officielle correspondante. Les cartes de cette démonstration sont fictives.";
    actions =
      btn(
        "OUVRIR LES ACTUALITÉS STEAM",
        'window.open("' + STEAM + '","_blank","noopener")',
        "red",
      ) + btn("FERMER", "closeModal()");
  } else if (m.type === "found") {
    title = "PARTIE TROUVÉE";
    body =
      "La partie est prête : le joueur passerait directement au chargement puis au largage aérien sur l’île. Cette étape est simulée.";
    actions = btn("RETOUR AU LOBBY", "closeModal()", "red");
  } else if (m.type === "delete") {
    title = "SUPPRIMER LA SAUVEGARDE ?";
    body =
      "Confirmer la suppression de " +
      m.name +
      " ? Cette démonstration ne modifie aucun fichier.";
    actions =
      btn("ANNULER", "closeModal()") +
      btn("SIMULER LA SUPPRESSION", "demoAction('Suppression simulée')", "red");
  } else {
    title = "MODE DÉMONSTRATION";
    body = m.msg;
    actions = btn("FERMER", "closeModal()", "red");
  }
  return `<div class="overlay"><div class="dialog"><h2>${title}</h2><p>${body}</p><div class="dialog-actions">${actions}</div></div></div>`;
}

export function closeModal() {
  state.modal = null;
  render();
}
