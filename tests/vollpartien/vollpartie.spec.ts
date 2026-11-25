import { expect, test, type Locator, type Page } from '@playwright/test'
import { ermittleEntscheider, serialisiere } from '../../src/engine'
import type { Spielzustand } from '../../src/engine'
import { ERGEBNIS, platzText } from '../../src/ui/ergebnis/texte'
import { LOBBY } from '../../src/ui/lobby/texte'
import { TISCH, punkteText } from '../../src/ui/tisch/texte'
import { oeffne } from '../layout/oeffnen'
import { spieleMenschenschritt } from './mensch'
import { erwarteteWertung, partieAusSaat, schrittZwischen } from './pruefung'
import { bedienung, beobachteKonsole, bereiteSeiteVor, gezogeneZufallswerte, lassKiSpielen, leseStand, pruefeSeite } from './seite'

/*
Z1 (Plan, Phase 5): ganze Partien im Browser, gespielt wie von einem Menschen.
Je Lauf beginnt die Partie in der Lobby mit echten Klicks (auf dem Handy mit
Tippen), der Mensch spielt jeden seiner Schritte über die Oberfläche nach
einer festen Regel (`mensch.ts`), die KI-Gegner spielen ihre Züge selbst, bis
die Wertung dasteht. Die Projekte (`playwright.vollpartien.config.ts`) sind
Desktop 1280×900 und Handy hochkant 390×844 mit Touch.

Feste Saat: Die Seite bekommt vor dem Laden ein `Math.random` aus der Saat des
Laufs (`bereiteSeiteVor`). Daraus mischt die Lobby die Partie und ziehen die
KI-Gegner ihre Saaten, wie in der ausgelieferten App; Testhooks braucht der
Lauf deshalb nicht, und er läuft gegen jeden Build, auch gegen eine
Vercel-Vorschau (`Z1_BASIS_URL`). Der erste Schritt prüft, dass der Startstand
genau die Partie dieser Saat ist.

Nach jedem Schritt, jedem Klick des Menschen wie jedem Zug eines KI-Gegners,
prüft der Lauf die Seite (`pruefeSeite`): kein Konsolenfehler, keine Karten-Id
aus einer fremden Hand in `page.content()`. Damit kein KI-Schritt ungesehen
vorbeigeht, steht die Uhr der Seite still; jeder KI-Schritt kommt erst, wenn
der Lauf die Uhr um die Pause vorstellt (`lassKiSpielen`). Jeder neue Stand
muss aus dem vorigen durch eine Aktion entstehen, die die Engine aufzählt
(`schrittZwischen`). Am Ende muss die angezeigte Wertung die Endwertung der
Engine aus dem gespeicherten Schlussstand sein.

Warum gelesen und nicht nachgespielt: Welche Aktion ein KI-Gegner gewählt hat,
steht nur in seinem Schritt; die Seite gibt sie nicht heraus. Der Lauf liest
deshalb nach jedem Schritt den gespeicherten Stand und belegt mit
`schrittZwischen`, dass die Kette vom Startstand der Saat bis zum Schluss aus
lauter erlaubten Aktionen besteht. Die Endwertung rechnet er dann selbst mit
der Engine aus diesem Schlussstand nach.

Die Läufe mit Erweiterung warten auf O10 (Erweiterung am Tisch): Ohne O10 kann
der Mensch die Entscheidungen der Erweiterung nicht bedienen. Sie stehen schon
in der Tabelle; M3 nimmt `wartetAuf` heraus. Übersprungen werden sie nicht mit
`test.skip`, das U6 verbietet, sondern gar nicht erst angelegt.
*/

interface Lauf {
  titel: string
  gegner: number
  erweiterung: boolean
  saat: number
  /** Der Task, ohne den der Lauf nicht gehen kann; `null`, wenn er läuft. */
  wartetAuf: string | null
}

/*
Die Saaten sind so gewählt, dass auch du Punkte machst (sonst prüfte die
Wertung bei dir nur eine 0) und zu viert ein Gleichstand zweier Sieger
entsteht (D22). Mit der Regel aus `mensch.ts` endete Saat 2026 zu zweit am
25.11.2026 mit Du 5, KI-Gegner 1 53; Saat 13 zu viert mit Du 3, KI-Gegner 1
und KI-Gegner 3 je 16. Ändert sich die KI oder der Tisch, ändern sich auch
die Partien; der Lauf bleibt gültig, nur diese Zahlen veralten.
*/
const LAEUFE: readonly Lauf[] = [
  { titel: 'Basis zu zweit', gegner: 1, erweiterung: false, saat: 2026, wartetAuf: null },
  { titel: 'Basis zu viert', gegner: 3, erweiterung: false, saat: 13, wartetAuf: null },
  { titel: 'Erweiterung zu zweit', gegner: 1, erweiterung: true, saat: 3101, wartetAuf: 'O10' },
  { titel: 'Erweiterung zu viert', gegner: 3, erweiterung: true, saat: 3103, wartetAuf: 'O10' },
]

/** Mehr Schritte hat keine Partie; wer hier ankommt, hängt. */
const HOECHSTENS_SCHRITTE = 4000

/** Wählt in der Lobby Gegnerzahl und Erweiterung und beginnt die Partie; gibt zurück, wie viele Zufallswerte vorher gezogen waren. */
async function starteInDerLobby(page: Page, lauf: Lauf, tippe: (element: Locator) => Promise<void>): Promise<number> {
  await oeffne(page, '/')
  if (lauf.gegner !== 1) await tippe(page.getByText(LOBBY.gegner(lauf.gegner), { exact: true }))
  await expect(page.getByRole('radio', { name: LOBBY.gegner(lauf.gegner) })).toBeChecked()
  if (lauf.erweiterung) await tippe(page.getByText(LOBBY.erweiterung, { exact: true }))
  const versatz = await gezogeneZufallswerte(page)
  await tippe(page.getByRole('button', { name: LOBBY.neuePartie }))
  await expect(page.getByRole('region', { name: TISCH.deineHand })).toBeVisible()
  return versatz
}

async function pruefeWertung(page: Page, ende: Spielzustand): Promise<string> {
  await expect(page.getByTestId('ergebnis')).toBeVisible()
  const liste = page.getByRole('list', { name: ERGEBNIS.rangliste })
  const zeilen: string[] = []
  for (const erwartet of erwarteteWertung(ende)) {
    const eintrag = liste.getByRole('listitem', { name: erwartet.name, exact: true })
    const wo = `Wertung von ${erwartet.name}`
    await expect(eintrag.getByTestId('gesamt'), `${wo}: Summe`).toHaveText(punkteText(erwartet.summe))
    expect(Number(await eintrag.getByTestId('posten-farbgruppen').innerText()), `${wo}: Farbgruppen`).toBe(erwartet.farbgruppen)
    expect(Number(await eintrag.getByTestId('posten-kette').innerText()), `${wo}: Längste Kette`).toBe(erwartet.kette)
    await expect(eintrag.locator('.erg-rang-platz'), `${wo}: Platz`).toHaveText(platzText(erwartet.platz))
    await expect(eintrag.getByText(ERGEBNIS.sieger, { exact: true }), `${wo}: Sieger`).toHaveCount(erwartet.sieger ? 1 : 0)
    if (erwartet.sieger) await expect(page.getByRole('heading', { level: 1 }), `${wo}: im Titel`).toContainText(erwartet.name)
    zeilen.push(`${erwartet.name} ${erwartet.summe}${erwartet.sieger ? ' (Sieger)' : ''}`)
  }
  return zeilen.join(', ')
}

for (const lauf of LAEUFE.filter(({ wartetAuf }) => wartetAuf === null)) {
  test(`Z1 K1/K2: ${lauf.titel} (Saat ${lauf.saat}) bis zur Wertung, über echte Klicks`, async ({ page }, info) => {
    const tippe = bedienung(info)
    const konsole = beobachteKonsole(page)
    await bereiteSeiteVor(page, lauf.saat)
    const versatz = await starteInDerLobby(page, lauf, tippe)

    let stand = await leseStand(page)
    const saatpartie = partieAusSaat(lauf.saat, versatz, lauf.gegner + 1, lauf.erweiterung)
    // Als Wahrheitswert: Der Unterschied zweier ganzer Stände wäre seitenlang und sagte nicht mehr.
    expect(serialisiere(stand) === serialisiere(saatpartie), `Z1: Der Startstand ist die Partie der Saat ${lauf.saat} nach ${versatz} gezogenen Werten`).toBe(true)
    await pruefeSeite(page, konsole, 'nach dem Start')

    let menschenschritte = 0
    let schritte = 0
    while (stand.partiephase !== 'Beendet') {
      if (++schritte > HOECHSTENS_SCHRITTE) throw new Error(`Z1: Nach ${HOECHSTENS_SCHRITTE} Schritten ist die Partie nicht beendet.`)
      const entscheider = ermittleEntscheider(stand)
      if (entscheider === null) throw new Error('Z1: Die Partie läuft, aber niemand entscheidet.')
      const wo = `Schritt ${schritte} (${stand.spieler[entscheider].name})`
      let neu: Spielzustand
      if (stand.spieler[entscheider].steuerung === 'KI') {
        neu = await lassKiSpielen(page, stand)
        await pruefeSeite(page, konsole, `nach ${wo}`)
      } else {
        // Der Mensch lässt nach jedem seiner Klicks prüfen, auch nach dem letzten.
        neu = await spieleMenschenschritt(page, stand, tippe, (was) => pruefeSeite(page, konsole, `${wo}, ${was}`))
        menschenschritte += 1
      }
      schrittZwischen(stand, neu)
      stand = neu
    }

    const wertung = await pruefeWertung(page, stand)
    await pruefeSeite(page, konsole, 'auf der Wertung')
    info.annotations.push({ type: 'Z1', description: `${schritte} Schritte, davon ${menschenschritte} von dir; Endwertung: ${wertung}` })
  })
}
