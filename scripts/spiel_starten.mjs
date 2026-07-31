/*
Author: Claude Code (S-5)
Datum: 31.07.2026
Version: 1.0
Beschreibung: Gemeinsame Startroutine für Smokes, die ein laufendes Spiel brauchen.

Hintergrund (Fixplan G4): Vier Smokes liefen in Timeouts, weil sie `/` aufrufen
und dort sofort das Spielbrett erwarten. `/` ist aber die Lobby — sie zeigt drei
Startknöpfe („Duell starten (1 KI)", „Waldparty starten (2 KI)", „Große Runde
starten (3 KI)") und rendert den Spieltisch erst danach. Die Skripte stammen aus
der Zeit, als `/` direkt das Brett zeigte.

Ein Skript (m95) navigierte sogar überhaupt nicht: Seine lokale `starteSpiel`
klickte auf `about:blank`, weil die HTTP-Prüfung davor mit `fetch` arbeitet und
nicht mit `page.goto`.

Statt die Startsequenz in jedes Skript zu kopieren, steht sie hier einmal —
dasselbe Muster wie `src/components/zielspurKey.ts` in der App.
*/

/**
 * Öffnet die Lobby und startet eine Partie, sodass der Spieltisch steht.
 *
 * Ist bereits eine Partie offen (z. B. weil das Skript direkt `/game` geladen
 * hat), bleibt der Aufruf wirkungslos — die Routine ist idempotent.
 *
 * @param page Playwright-Page
 * @param basisUrl Basis-URL ohne Pfad
 * @param optionen.route Route, über die gestartet wird (Vorgabe `/`)
 */
export async function startePartie(page, basisUrl, optionen = {}) {
  const { route = '/' } = optionen

  const antwort = await page.goto(new URL(route, basisUrl).toString(), { waitUntil: 'domcontentloaded' })
  if (!antwort || antwort.status() !== 200) {
    throw new Error(`Spielstart: ${route} lieferte HTTP ${antwort?.status()}`)
  }

  /* Als „läuft" gilt: Der Spieler hat eine Hand. Das ist das einzige Signal,
     das auf beiden Routen gilt — `/` rendert die Partie im klassischen
     Panel-Layout, `/game` als Waldtanz-Bühne, und die Landmarks unterscheiden
     sich entsprechend (M2e/M2r sind route-scoped). Ein Wait auf eine bestimmte
     Region würde je nach Route ins Leere laufen. */
  const hand = page.locator('.handkarte__button--karte').first()
  if ((await hand.count()) > 0) return

  const startknopf = page.getByRole('button', { name: /starten \(\d+ KI\)/ }).first()
  if ((await startknopf.count()) === 0) {
    throw new Error(`Spielstart: auf ${route} weder laufende Partie noch Startknopf gefunden`)
  }
  await startknopf.click()
  await hand.waitFor({ state: 'visible', timeout: 15_000 })
}

/**
 * Startet zusätzlich die erste eigene Schlange, damit Anlegeplätze und
 * Schlangenreihen existieren. Ohne diesen Schritt ist das Brett leer.
 */
export async function starteErsteSchlange(page) {
  const faehrte = page.getByRole('button', { name: /Startfährte .* als neue Schlange starten/ }).first()
  if ((await faehrte.count()) === 0) {
    throw new Error('Spielstart: keine Startfährte zum Anlegen der ersten Schlange gefunden')
  }
  await faehrte.click()
}
