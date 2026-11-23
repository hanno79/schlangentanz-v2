import { useState } from 'react'
import type { Spielzustand } from '../engine'
import { fehlertext } from '../engine'
import { speichereSpielstand } from '../spielstand'
import Rahmen from '../ui/lobby/Rahmen'
import { SPIEL, ZURUECK_ZUR_LOBBY } from '../ui/lobby/texte'
import Verweis from '../ui/lobby/Verweis'
import Spielseite from '../ui/spiel/Spielseite'
import { leseEntwicklerAnfrage } from './adresse'
import { kiSaatquelle, starteEntwicklerPartie } from './partie'
import { erzeugeSzenario } from './szenarien'

/*
Testhooks unter `/spiel` (Plan O3, Kriterium 7), nur im Dev-Server und im
Testhook-Build; der App-Rahmen lädt diese Datei nur dort nach.

- `?szenario=<name>`: ein Szenario des Entwicklertischs.
- `?seed=<saat>&spieler=<2–4>[&erweiterung=0|1]`: eine Partie aus dieser Saat,
  dieselben Parameter wie am Entwicklertisch.
- `?tempo=sofort`: die KI spielt ohne Pause.

Unter `?seed=` bekommen auch die KI-Gegner feste Saaten (`kiSaatquelle`), damit
sich eine Partie mit denselben Klicks nachspielen lässt (O6); nach dem Neuladen
kommen sie wieder aus `Math.random`.

Ein Szenario oder eine Saat wird gespeichert, als hätte die Lobby die Partie
angelegt, und verschwindet danach aus der Adresse; nur `tempo` bleibt. So
setzt ein Neuladen die laufende Partie fort, statt das Szenario neu zu
beginnen. Ein falscher Parameter wird gemeldet, nie still ersetzt, und lässt
einen vorhandenen Spielstand stehen.
*/

type Vorbereitung = { art: 'bereit'; pause: number | undefined; saatquelle: (() => number) | undefined } | { art: 'fehler'; meldung: string }

interface Start {
  zustand: Spielzustand
  saatquelle?: () => number
}

function startzustand(suche: string): Start | null {
  const anfrage = leseEntwicklerAnfrage('/dev', suche)
  switch (anfrage.art) {
    case 'start':
      return null
    case 'szenario':
      return { zustand: erzeugeSzenario(anfrage.name) }
    case 'partie':
      return { zustand: starteEntwicklerPartie(anfrage.saat, anfrage.spieler, anfrage.erweiterung === 1), saatquelle: kiSaatquelle(anfrage.saat) }
    case 'fehler':
      throw new Error(anfrage.meldung)
    default:
      throw new Error(`Die Adresse /spiel${suche} verlangt etwas, das es unter /spiel nicht gibt.`)
  }
}

/** Legt den verlangten Stand an und räumt die Adresse auf; wiederholt aufgerufen, findet es nichts mehr zu tun. */
function bereiteVor(): Vorbereitung {
  const parameter = new URLSearchParams(window.location.search)
  const tempo = parameter.get('tempo')
  if (tempo !== null && tempo !== 'sofort') return { art: 'fehler', meldung: `Parameter tempo kennt nur „sofort“, erhalten: „${tempo}“.` }
  let start: Start | null
  try {
    start = startzustand(window.location.search)
  } catch (fehler) {
    return { art: 'fehler', meldung: fehlertext(fehler) }
  }
  if (start !== null) {
    speichereSpielstand(start.zustand)
    window.history.replaceState(window.history.state, '', tempo === null ? '/spiel' : '/spiel?tempo=sofort')
  }
  return { art: 'bereit', pause: tempo === 'sofort' ? 0 : undefined, saatquelle: start?.saatquelle }
}

export default function SpielTesthooks() {
  // Im Initialisierer, damit die Spielseite beim ersten Zeichnen schon den neuen Stand liest.
  const [vorbereitung] = useState(bereiteVor)
  if (vorbereitung.art === 'fehler') {
    return (
      <Rahmen testId="spiel" titel={SPIEL.titel} fuss={<Verweis ziel="lobby">{ZURUECK_ZUR_LOBBY}</Verweis>}>
        <p className="rahmen-hinweis rahmen-hinweis--fehler" role="alert">
          {vorbereitung.meldung}
        </p>
      </Rahmen>
    )
  }
  return <Spielseite pause={vorbereitung.pause} saatquelle={vorbereitung.saatquelle} />
}
