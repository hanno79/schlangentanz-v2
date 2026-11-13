/// <reference lib="dom" />

/*
jsdom kennt `<dialog>`, aber nicht `showModal()` und `close()`. Für
Komponententests reicht das Verhalten, das die Oberfläche nutzt: `open` setzen
und beim Schliessen das Ereignis `close` auslösen. Ob der echte Dialog modal ist,
Escape schliesst und den Fokus zurückgibt, messen die Playwright-Verträge.
*/
export function dialogNachbilden(): void {
  const dialog = HTMLDialogElement.prototype
  dialog.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '')
  }
  dialog.close = function close(this: HTMLDialogElement) {
    if (!this.hasAttribute('open')) return
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  }
}
