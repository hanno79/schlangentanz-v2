import { Karte } from '../karten/Karte'
import { kartenkurzname } from '../karten/kartentexte'
import { wahlSchluessel } from '../spiel/auswahl'
import type { Wahl } from '../spiel/auswahl'
import type { TischAnsicht } from '../spiel/tischAnsicht'
import type { Bedienung } from './bedienung'
import { entscheidungsMoeglichkeit, kontextAmTisch } from './entscheidungstexte'
import type { Entscheidungskontext, Moeglichkeit } from './entscheidungstexte'
import { ERWEITERUNG, KORB_BONUS, RISIKOAKTION } from './erweiterungstexte'
import { KARTENGROESSE } from './groessen'
import { ZielKnopf } from './Ziele'
import { FRASS_OPTION } from './zugtexte'

/*
Die festen Möglichkeiten in der Zugleiste (O5, O10): die drei des
Schlangenfrass, die vier Risiko-Aktionen, die Boni des Schlangenkorbs und die
Möglichkeiten einer Entscheidung. Jede ist ein Ziel, das man antippt; danach
nennt die Zugleiste die Ansage, und erst „Ausführen“ spielt sie. Nennt eine
Möglichkeit eine Karte, etwa eine Karte deiner Ablage, steht die Karte als
kleines Bild mit ihrem kurzen Namen im Knopf.

Dazu die Knöpfe, mit denen eine Aktion ohne Handkarte beginnt: die
Comeback-Karte und die Risiko-Karte deiner Auslage und „Zwei Karten abwerfen,
drei ziehen“. Sie stehen nur da, solange nichts gewählt ist und die Engine sie
anbietet (U3).
*/

/** Name und Karte einer festen Möglichkeit, oder `null`, wenn die Wahl keine ist. */
function moeglichkeit(wahl: Wahl, kontext: Entscheidungskontext | null): Moeglichkeit | null {
  switch (wahl.art) {
    case 'frass':
      return { name: FRASS_OPTION[wahl.option], karte: null }
    case 'risikoaktion':
      return { name: RISIKOAKTION[wahl.nummer], karte: null }
    case 'korbbonus':
      return { name: KORB_BONUS[wahl.bonus], karte: null }
    case 'entscheiden':
      if (kontext === null) throw new Error(`Die Wahl ${wahl.wahl} gehört zu keiner offenen Entscheidung (X3).`)
      return entscheidungsMoeglichkeit(wahl.wahl, kontext)
    default:
      return null
  }
}

export function Moeglichkeiten({ ansicht, bedienung }: { ansicht: TischAnsicht; bedienung: Bedienung }) {
  // Die Namen am Tisch einmal je Zeichnen, nicht je Möglichkeit: Eine lange Ablage gibt viele (D54).
  const kontext = ansicht.entscheidung === null ? null : kontextAmTisch(ansicht)
  const liste = bedienung.angebote.flatMap((wahl) => {
    const eintrag = moeglichkeit(wahl, kontext)
    return eintrag === null ? [] : [{ wahl, ...eintrag }]
  })
  if (liste.length === 0) return null
  // Die langen Sätze des Schlangenfrass untereinander, die kürzeren Möglichkeiten der Erweiterung nebeneinander, damit die Leiste niedrig bleibt.
  const raster = liste.some((eintrag) => eintrag.wahl.art !== 'frass')
  return (
    <div className={raster ? 'st-zugleiste-optionen st-zugleiste-optionen--raster' : 'st-zugleiste-optionen'}>
      {liste.map(({ wahl, name, karte }) => (
        <ZielKnopf key={wahlSchluessel(wahl)} wahl={wahl} name={name} klasse={karte === null ? 'st-ziel--option' : 'st-ziel--option st-ziel--mitkarte'}>
          {karte !== null && <Karte karte={karte} sizes={KARTENGROESSE.klein} />}
          {/* Mit Karte steht nur ihr kurzer Name sichtbar da; der ganze steckt im Namen des Knopfs. */}
          <span>{karte === null ? name : kartenkurzname(karte)}</span>
        </ZielKnopf>
      ))}
    </div>
  )
}

/** Ein Knopf, der eine Aktion ohne Handkarte beginnt. */
function Startknopf({ bedienung, wahl, children }: { bedienung: Bedienung; wahl: Wahl; children: string }) {
  return (
    <button type="button" className="st-knopf" data-wahl={wahlSchluessel(wahl)} onClick={() => bedienung.tippe(wahl)}>
      {children}
    </button>
  )
}

/** Comeback-Karte, Risiko-Karte und „Zwei Karten abwerfen, drei ziehen“, solange nichts gewählt ist (A8.1, A8.2, D49). */
export function Auslageknoepfe({ ansicht, bedienung }: { ansicht: TischAnsicht; bedienung: Bedienung }) {
  if (bedienung.auswahl.length > 0) return null
  const { comeback, risikoKarten } = ansicht.ich
  const risiko = risikoKarten.find((karte) => bedienung.spielbar(karte.id))
  const zweiAbwerfen: Wahl = { art: 'zweiAbwerfenDreiZiehen' }
  return (
    <>
      {comeback !== null && bedienung.spielbar(comeback.karte.id) && (
        <Startknopf bedienung={bedienung} wahl={{ art: 'karte', karteId: comeback.karte.id }}>
          {ERWEITERUNG.comebackEinsetzen}
        </Startknopf>
      )}
      {risiko !== undefined && (
        <Startknopf bedienung={bedienung} wahl={{ art: 'karte', karteId: risiko.id }}>
          {ERWEITERUNG.risikoSpielen}
        </Startknopf>
      )}
      {bedienung.angeboten(zweiAbwerfen) && (
        <Startknopf bedienung={bedienung} wahl={zweiAbwerfen}>
          {ERWEITERUNG.zweiAbwerfen}
        </Startknopf>
      )}
    </>
  )
}
