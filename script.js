const rsvpButton = document.querySelector("[data-rsvp]");
const rsvpNote = document.querySelector("[data-rsvp-note]");

if (rsvpButton && rsvpNote) {
  rsvpButton.addEventListener("click", () => {
    rsvpNote.hidden = false;
    rsvpButton.textContent = "到时候见";
    rsvpButton.setAttribute("aria-pressed", "true");
    rsvpNote.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
}
