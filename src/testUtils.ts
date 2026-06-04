/*
Author: rahn
Datum: 04.06.2026
Version: 1.0
Beschreibung: Gemeinsame Test-Helfer für UI-Aktionsnamen in Schlangentanz v2.
*/

export function aktionsName(button: HTMLElement): string {
  return button.getAttribute('aria-label') ?? button.textContent?.trim() ?? ''
}
