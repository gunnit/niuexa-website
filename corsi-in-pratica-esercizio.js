const copyButton = document.querySelector("[data-copy-prompt]");
const promptText = document.querySelector("#prompt");
const feedback = document.querySelector("#copy-feedback");

if (copyButton && promptText && feedback && navigator.clipboard?.writeText) {
  copyButton.hidden = false;
  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(promptText.textContent.trim());
      feedback.textContent = "Prompt copiato.";
    } catch {
      feedback.textContent = "Seleziona il testo del prompt e copialo.";
    }
  });
}
