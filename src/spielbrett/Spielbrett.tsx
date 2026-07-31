/*
Author: Claude Code (G-2)
Datum: 31.07.2026
Version: 1.0
Beschreibung: Das neue Spielbrett — sieben Regionen (docs/SPIELBRETT_SPEC.md).

Setzt auf die Zustandsschicht `src/hooks/usePartie.ts` auf, damit es sich
dieselbe Quelle mit der alten Ansicht teilt.

**Stand G-2.** Gerüst plus die generische Aktionsliste. Die Aktionsliste kommt
bewusst zuerst: Sie ist Regel 6 der Spezifikation — jede legale Aktion muss über
mindestens einen sichtbaren Weg erreichbar sein. Genau ihr Fehlen hat den alten
Zustand erzeugt, in dem freie Schlangenhäutung und Kartenwahl beim Pflichtabwurf
gar nicht mehr spielbar waren. Die Brettflächen der folgenden Pakete sind
Komfort obendrauf, nicht die Voraussetzung.

Noch nicht gebaut: Anlegeplätze am Brett (G-3), Abwurfmodus (G-4), Gegner und
Stapel (G-6), Reaktionsdialog als eigene Fläche (G-7 — bis dahin stehen die
Reaktionsaktionen in der Aktionsliste und sind damit erreichbar).
*/

import './spielbrett.css'
import { MAX_KARTEN_PRO_ZUG, MAX_SCHLANGEN_PRO_SPIELER } from '../engine'
import type { SpielAktion } from '../engine'
import { gruppiereWirkungsgleicheAktionen } from '../aktionsGruppen'
import type { usePartie } from '../hooks/usePartie'
import useLegaleAktionenNachTyp from '../hooks/useLegaleAktionenNachTyp'
import { zugphaseLabel } from '../zugphaseLabels'
import Kartenmarke from './Kartenmarke'
import { ermittlePhasenSchritt } from './phasenSchritt'

interface SpielbrettProps {
  partie: ReturnType<typeof usePartie>
}

export default function Spielbrett({ partie }: SpielbrettProps) {
  const {
    zustand,
    letzteAktion,
    ausgewaehlteHandkarteAuswahl,
    setAusgewaehlteHandkarteAuswahl,
    ueberhand,
    aktionsLabel,
    fuhreAktionAus,
    handleAusspielphaseStarten,
    handleAusspielphaseBeenden,
    handleAufgabenpruefungBeenden,
    handleUeberzaehligeKartenAbwerfen,
    handleZugBeenden,
    handleKiZugVorspulen,
  } = partie

  const { legaleAktionen, reaktionsAktionen } = useLegaleAktionenNachTyp(zustand)

  const aktiver = zustand.spieler[zustand.aktiverSpielerIndex]
  const gegner = zustand.spieler.filter((spieler) => spieler.id !== aktiver.id)
  const istKiAmZug = aktiver.steuerung === 'KI'
  const hatOffeneReaktion = reaktionsAktionen.length > 0
  const schritt = ermittlePhasenSchritt(zustand, ueberhand, hatOffeneReaktion)

  const ausgewaehlteKarteId =
    ausgewaehlteHandkarteAuswahl?.spielerId === aktiver.id ? ausgewaehlteHandkarteAuswahl.karteId : null

  /* Solange eine Reaktion offen ist, sind das die *einzigen* zulässigen
     Aktionen — die Engine lehnt alles andere ab. */
  const rohAktionen: SpielAktion[] = hatOffeneReaktion ? reaktionsAktionen : legaleAktionen
  /* Die Engine enumeriert eine Aktion pro Handkarte. Eine Hand aus fünf blauen
     Karten erzeugt fünf identisch beschriftete Knöpfe — für Screenreader nicht
     unterscheidbar und für den Spieler kein Informationsgewinn. Gruppiert wird
     nur die Anzeige; geklickt wird weiterhin eine konkrete Aktion. */
  const angeboteneAktionen = gruppiereWirkungsgleicheAktionen(rohAktionen, aktiver.hand)

  const budget = zustand.zugpflichten
  const maxKarten = budget.verdopplerBonusAktiv ? MAX_KARTEN_PRO_ZUG + 1 : MAX_KARTEN_PRO_ZUG

  function schrittAusloesen() {
    if (schritt === null) return
    switch (schritt.schluessel) {
      case 'ausspielphaseStarten': return handleAusspielphaseStarten()
      case 'ausspielphaseBeenden': return handleAusspielphaseBeenden()
      case 'aufgabenpruefungBeenden': return handleAufgabenpruefungBeenden()
      case 'ueberzaehligeAbwerfen': return handleUeberzaehligeKartenAbwerfen()
      case 'zugBeenden': return handleZugBeenden()
      case 'kiZugAbspielen': return handleKiZugVorspulen()
    }
  }

  return (
    <main className="spielbrett">
      {/* 1 — Kopfleiste */}
      <header className="brett-kopf brett-bereich" aria-label="Spielstand">
        <p className="brett-kopf__block">
          <span className="brett-kopf__name">{aktiver.name}</span>
          <span className="brett-kopf__leise">
            {aktiver.hand.length} Karten · {aktiver.schlangen.length}/{MAX_SCHLANGEN_PRO_SPIELER} Schlangen
          </span>
        </p>
        <p className="brett-kopf__block">
          <span className="brett-kopf__leise">Phase</span>
          <span className="brett-kopf__wert">{zugphaseLabel(zustand.zugphase)}</span>
        </p>
        <p className="brett-kopf__block">
          <span className="brett-kopf__leise">Gespielt</span>
          <span className="brett-kopf__wert">
            {budget.gespielteKarten}/{maxKarten} Karten
          </span>
          {budget.verdopplerBonusAktiv ? (
            <span className="brett-kopf__leise">(Verdoppler: eine mehr)</span>
          ) : null}
        </p>
        {zustand.spielphase === 'Endspurt' ? (
          <p className="brett-kopf__warnung">Endspurt — Aufgaben zählen doppelt</p>
        ) : null}
        <ul className="brett-kopf__gegner">
          {gegner.map((spieler) => (
            <li key={spieler.id} className="brett-kopf__block">
              <span className="brett-kopf__leise">{spieler.name}</span>
              <span className="brett-kopf__wert">{spieler.schlangen.length} Schlangen</span>
            </li>
          ))}
        </ul>
      </header>

      {/* 2 — Spielfläche */}
      <section className="brett-flaeche brett-bereich" aria-label="Deine Schlangen">
        <h2 className="brett-bereich__titel">Deine Schlangen</h2>
        {aktiver.schlangen.length === 0 ? (
          <p className="brett-leer">
            Noch keine Schlange. Wähle in der Aktionsliste „neue Schlange starten".
          </p>
        ) : (
          aktiver.schlangen.map((schlange, index) => (
            <div key={schlange.id} className="brett-schlange">
              <span className="brett-schlange__marke">
                {index + 1}. Schlange · {schlange.zustand}
              </span>
              <ul className="brett-hand__karten">
                {schlange.karten.map((karte) => (
                  <Kartenmarke key={karte.id} karte={karte} />
                ))}
              </ul>
            </div>
          ))
        )}
      </section>

      {/* 3 — Gegnerstreifen (Inhalt folgt in G-6) */}
      <section className="brett-gegner brett-bereich" aria-label="Gegner-Schlangen">
        <h2 className="brett-bereich__titel">Gegner</h2>
        <p className="brett-leer">
          {gegner.every((spieler) => spieler.schlangen.length === 0)
            ? 'Noch keine gegnerischen Schlangen.'
            : gegner
                .map((spieler) => `${spieler.name}: ${spieler.schlangen.length} Schlange(n)`)
                .join(' · ')}
        </p>
      </section>

      {/* 4 — Seitenspalte: die Aktionsliste als Rückfallebene (Regel 6) */}
      <section className="brett-seite brett-bereich" aria-label="Aktionen">
        <h2 className="brett-bereich__titel">
          {hatOffeneReaktion ? 'Du wirst angegriffen' : 'Mögliche Aktionen'}
        </h2>
        {istKiAmZug && !hatOffeneReaktion ? (
          <p className="brett-leer">{aktiver.name} ist am Zug.</p>
        ) : angeboteneAktionen.length === 0 ? (
          <p className="brett-leer">Gerade keine Aktion möglich.</p>
        ) : (
          <ul className="brett-aktionsliste">
            {angeboteneAktionen.map((gruppe, index) => (
              <li key={`${gruppe.aktion.typ}-${index}`}>
                <button
                  type="button"
                  className="brett-knopf brett-knopf--leise brett-aktionsliste__eintrag"
                  onClick={() => fuhreAktionAus(gruppe.aktion)}
                >
                  {aktionsLabel(gruppe.aktion)}
                  {gruppe.anzahl > 1 ? ` (${gruppe.anzahl} gleichwertige Karten)` : ''}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 5 — Handleiste */}
      <section className="brett-hand brett-bereich" aria-label="Deine Hand">
        <h2 className="brett-bereich__titel">
          Deine Hand · {aktiver.hand.length} Karten
          {ueberhand > 0 ? ` · ${ueberhand} zu viel` : ''}
        </h2>
        <ul className="brett-hand__karten">
          {aktiver.hand.map((karte) => (
            <Kartenmarke
              key={karte.id}
              karte={karte}
              verdeckt={istKiAmZug}
              gewaehlt={ausgewaehlteKarteId === karte.id}
              onWaehlen={
                istKiAmZug
                  ? undefined
                  : () =>
                      setAusgewaehlteHandkarteAuswahl((aktuell) =>
                        aktuell?.spielerId === aktiver.id && aktuell.karteId === karte.id
                          ? null
                          : { spielerId: aktiver.id, karteId: karte.id },
                      )
              }
            />
          ))}
        </ul>
      </section>

      {/* 6 — der eine Knopf, der den Zug voranbringt */}
      <section className="brett-aktion brett-bereich" aria-label="Zugaktion">
        {schritt === null ? (
          <p className="brett-leer">
            {zustand.zugphase === 'Spielende' ? 'Spiel beendet.' : 'Zuerst oben entscheiden.'}
          </p>
        ) : (
          <button
            type="button"
            className="brett-knopf brett-knopf--gross"
            onClick={schrittAusloesen}
            disabled={schritt.gesperrtWeil !== null}
          >
            {schritt.text}
          </button>
        )}
        {schritt?.gesperrtWeil ? <p className="brett-leer">{schritt.gesperrtWeil}</p> : null}
      </section>

      {/* 7 — Statuszeile */}
      <footer className="brett-status brett-bereich" aria-label="Spielverlauf">
        <span>
          <span className="brett-status__leise">Nachziehstapel </span>
          {zustand.nachziehstapel.length}
          <span className="brett-status__leise"> · Ablage </span>
          {zustand.ablagestapel.length}
          <span className="brett-status__leise"> · offene Aufgaben </span>
          {zustand.offeneAufgaben.length}
        </span>
        {letzteAktion ? (
          <span>
            <span className="brett-status__leise">Zuletzt: </span>
            {letzteAktion}
          </span>
        ) : null}
      </footer>
    </main>
  )
}
