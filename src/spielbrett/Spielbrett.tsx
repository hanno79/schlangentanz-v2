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
import { HANDKARTENLIMIT, MAX_KARTEN_PRO_ZUG, MAX_SCHLANGEN_PRO_SPIELER } from '../engine'
import type { SpielAktion } from '../engine'
import { gruppiereWirkungsgleicheAktionen } from '../aktionsGruppen'
import type { usePartie } from '../hooks/usePartie'
import useLegaleAktionenNachTyp from '../hooks/useLegaleAktionenNachTyp'
import { zugphaseLabel } from '../zugphaseLabels'
import Kartenmarke from './Kartenmarke'
import { ermittlePhasenSchritt } from './phasenSchritt'
import { findeAnlegeAktion, findeStartAktion, schlangenMitZiel } from './brettziele'
import { ermittleHandModus, handHinweis } from './handModus'
import { ermittleSpielerLagen, geheimeAufgabeDesMenschen } from './spielerLage'
import { naechsterPflichtschrittLabel } from '../spielLabelHelpers'

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
    abwurfAuswahl,
    handleAbwurfToggle,
    aktionsLabel,
    fuhreAktionAus,
    handleAusspielphaseStarten,
    handleAusspielphaseBeenden,
    handleAufgabenpruefungBeenden,
    handleUeberzaehligeKartenAbwerfen,
    handleZugBeenden,
    handleKiZugVorspulen,
  } = partie

  const {
    legaleAktionen,
    reaktionsAktionen,
    karteAnlegenAktionen,
    neueSchlangeStartenAktionen,
    nichtEnumerierteAktionenHinweise,
  } = useLegaleAktionenNachTyp(zustand)

  const aktiver = zustand.spieler[zustand.aktiverSpielerIndex]
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

  /* Brettziele zur gerade gewählten Handkarte. Ohne Auswahl ist alles leer —
     der Spieler wählt erst die Karte, dann das Ziel. */
  const startAktion = findeStartAktion(neueSchlangeStartenAktionen, ausgewaehlteKarteId)
  const zielSchlangen = schlangenMitZiel(karteAnlegenAktionen, ausgewaehlteKarteId)

  /* Pflichtabwurf-Aktionen entstehen nur, wenn sonst gar nichts legal ist —
     die Engine garantiert das. Deshalb ist der Handmodus eindeutig. */
  const pflichtAbwurfAktionen = legaleAktionen.filter((aktion) => aktion.typ === 'PflichtAbwurf')
  const handModus = ermittleHandModus(zustand, ueberhand, pflichtAbwurfAktionen.length > 0)
  const hinweis = handHinweis(handModus, ueberhand, abwurfAuswahl.length)

  const budget = zustand.zugpflichten
  const maxKarten = budget.verdopplerBonusAktiv ? MAX_KARTEN_PRO_ZUG + 1 : MAX_KARTEN_PRO_ZUG
  const lagen = ermittleSpielerLagen(zustand)
  const eigeneLage = lagen.find((lage) => lage.id === aktiver.id)
  const geheimeAufgabe = geheimeAufgabeDesMenschen(zustand)
  const pflichtschritt = naechsterPflichtschrittLabel(
    zustand,
    legaleAktionen,
    nichtEnumerierteAktionenHinweise,
    ueberhand,
  )

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
          <span className="brett-kopf__wert">{eigeneLage?.punkte ?? 0} Punkte</span>
          <span className="brett-kopf__leise">
            {aktiver.hand.length}/{HANDKARTENLIMIT} Karten · {aktiver.schlangen.length}/
            {MAX_SCHLANGEN_PRO_SPIELER} Schlangen
          </span>
        </p>
        <p className="brett-kopf__block">
          <span className="brett-kopf__leise">Phase</span>
          <span className="brett-kopf__wert">{zugphaseLabel(zustand.zugphase)}</span>
        </p>
        {/* Das Zugbudget stand vorher nirgends auf /game — der Spieler sah
            weder, wie viel er noch darf, noch dass der Verdoppler eine Karte
            mehr erlaubt. */}
        <p className="brett-kopf__block">
          <span className="brett-kopf__leise">Gespielt</span>
          <span className="brett-kopf__wert">
            {budget.gespielteKarten}/{maxKarten} Karten
          </span>
          <span className="brett-kopf__leise">
            ({budget.gespielteFarbkarten} Farb-, {budget.gespielteSonderkarten} Sonderkarten)
          </span>
          {budget.verdopplerBonusAktiv ? (
            <span className="brett-kopf__wert">Verdoppler aktiv</span>
          ) : null}
        </p>
        {zustand.spielphase === 'Endspurt' ? (
          <p className="brett-kopf__warnung">Endspurt — Aufgaben zählen doppelt</p>
        ) : null}
        {eigeneLage?.setztAus ? (
          <p className="brett-kopf__warnung">Du setzt aus — Schlangengrube</p>
        ) : null}
      </header>

      {/* 2 — Spielfläche */}
      <section className="brett-flaeche brett-bereich" aria-label="Deine Schlangen">
        <h2 className="brett-bereich__titel">
          Deine Schlangen · {aktiver.schlangen.length}/{MAX_SCHLANGEN_PRO_SPIELER}
        </h2>

        {/* Startkreis — sichtbar, solange das Schlangenlimit es zulässt. Er
            verschwindet nicht stumm, sondern sagt, warum er gesperrt ist. */}
        {aktiver.schlangen.length < MAX_SCHLANGEN_PRO_SPIELER ? (
          <button
            type="button"
            className={`brett-startkreis${startAktion ? ' brett-startkreis--bereit' : ''}`}
            onClick={() => startAktion && fuhreAktionAus(startAktion)}
            disabled={startAktion === null}
          >
            Startkreis — neue Schlange
            <span className="brett-leer">
              {/* Drei verschiedene Gründe, und der Spieler muss sie
                  unterscheiden können: keine Auswahl, das Zugbudget ist
                  aufgebraucht, oder diese eine Karte passt nicht. */}
              {ausgewaehlteKarteId === null
                ? 'Erst eine Handkarte wählen'
                : startAktion
                  ? 'Hier klicken, um zu starten'
                  : neueSchlangeStartenAktionen.length === 0
                    ? 'In diesem Zug nicht mehr möglich'
                    : 'Mit dieser Karte nicht möglich'}
            </span>
          </button>
        ) : (
          <p className="brett-leer">
            Schlangenlimit erreicht ({MAX_SCHLANGEN_PRO_SPIELER}) — keine neue Schlange möglich.
          </p>
        )}

        {aktiver.schlangen.map((schlange, index) => {
          const linksAktion = findeAnlegeAktion(karteAnlegenAktionen, ausgewaehlteKarteId, schlange.id, 'links')
          const rechtsAktion = findeAnlegeAktion(karteAnlegenAktionen, ausgewaehlteKarteId, schlange.id, 'rechts')
          return (
            <div
              key={schlange.id}
              className={`brett-schlange${zielSchlangen.has(schlange.id) ? ' brett-schlange--ziel' : ''}`}
            >
              <span className="brett-schlange__marke">
                {index + 1}. Schlange · {schlange.zustand}
              </span>
              {/* Links und rechts sind eigene Ziele: Dieselbe Karte ergibt je
                  nach Seite eine andere Schlange und andere Punkte. */}
              <button
                type="button"
                className="brett-anlegeplatz"
                aria-label={`Karte links an ${index + 1}. Schlange anlegen`}
                onClick={() => linksAktion && fuhreAktionAus(linksAktion)}
                disabled={linksAktion === null}
              >
                ◀ links
              </button>
              <ul className="brett-hand__karten">
                {schlange.karten.map((karte) => (
                  <Kartenmarke key={karte.id} karte={karte} />
                ))}
              </ul>
              <button
                type="button"
                className="brett-anlegeplatz"
                aria-label={`Karte rechts an ${index + 1}. Schlange anlegen`}
                onClick={() => rechtsAktion && fuhreAktionAus(rechtsAktion)}
                disabled={rechtsAktion === null}
              >
                rechts ▶
              </button>
            </div>
          )
        })}
      </section>

      {/* 3 — Gegnerstreifen. Die Schlangen der Gegner folgen in G-6. */}
      <section className="brett-gegner brett-bereich" aria-label="Gegner">
        <h2 className="brett-bereich__titel">Gegner</h2>
        <ul className="brett-gegner__liste">
          {lagen
            .filter((lage) => lage.id !== aktiver.id)
            .map((lage) => (
              <li key={lage.id} className="brett-kopf__block">
                <span className="brett-kopf__wert">{lage.name}</span>
                <span className="brett-kopf__leise">
                  {lage.punkte} Punkte · {lage.schlangen} Schlangen · {lage.handkarten} Karten
                </span>
                {/* Wer aussetzt, stand vor diesem Paket nirgends im Brett. */}
                {lage.setztAus ? <span className="brett-kopf__warnung">setzt aus</span> : null}
              </li>
            ))}
        </ul>
      </section>

      {/* 4 — Seitenspalte: geheime Aufgabe und die Aktionsliste als
          Rückfallebene (Regel 6) */}
      <section className="brett-seite brett-bereich" aria-label="Aktionen">
        {/* Nur die eigene geheime Aufgabe — die einer KI zu zeigen wäre kein
            Anzeigefehler, sondern ein Regelbruch. */}
        {geheimeAufgabe ? (
          <p className="brett-geheimaufgabe">
            <span className="brett-bereich__titel">Deine geheime Aufgabe</span>
            <span>{geheimeAufgabe.text}</span>
            {geheimeAufgabe.erfuellt ? <span className="brett-kopf__wert">✓ erfüllt</span> : null}
          </p>
        ) : null}
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
                {/* Die erste Aktion ist die empfohlene — dieselbe Konvention wie
                    im alten AktionenPanel. Dort war die Empfehlung auf /game nur
                    Text mit einem Sprunglink, der ins versteckte Panel zeigte
                    und damit ins Leere. Hier ist sie ein Knopf. */}
                <button
                  type="button"
                  className={
                    'brett-knopf brett-aktionsliste__eintrag' +
                    (index === 0 ? '' : ' brett-knopf--leise')
                  }
                  onClick={() => fuhreAktionAus(gruppe.aktion)}
                >
                  {index === 0 ? <span className="brett-aktionsliste__marke">Empfohlen</span> : null}
                  {aktionsLabel(gruppe.aktion)}
                  {gruppe.anzahl > 1 ? ` (${gruppe.anzahl} gleichwertige Karten)` : ''}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 5 — Handleiste. Der Klick bedeutet je nach Modus etwas anderes; der
          Hinweis darüber sagt, was gerade gilt. */}
      <section className="brett-hand brett-bereich" aria-label="Deine Hand">
        <h2 className="brett-bereich__titel">
          Deine Hand · {aktiver.hand.length}/{HANDKARTENLIMIT} Karten
        </h2>
        {hinweis ? <p className="brett-hand__hinweis">{hinweis}</p> : null}
        <ul className="brett-hand__karten">
          {aktiver.hand.map((karte, platz) => {
            /* Beim Pflichtabwurf ist nicht jede Karte erlaubt: Die Engine lässt
               nur Karten zu, deren Art das Zugbudget noch hergibt. */
            const abwurfAktion = pflichtAbwurfAktionen.find(
              (aktion) => 'handkartenId' in aktion && aktion.handkartenId === karte.id,
            )
            const gewaehlt =
              handModus === 'ueberhand'
                ? abwurfAuswahl.includes(karte.id)
                : ausgewaehlteKarteId === karte.id

            let onWaehlen: (() => void) | undefined
            if (handModus === 'ueberhand') onWaehlen = () => handleAbwurfToggle(karte.id)
            else if (handModus === 'abwurfPflicht')
              onWaehlen = abwurfAktion ? () => fuhreAktionAus(abwurfAktion) : undefined
            else if (handModus === 'auswahl')
              onWaehlen = () =>
                setAusgewaehlteHandkarteAuswahl((aktuell) =>
                  aktuell?.spielerId === aktiver.id && aktuell.karteId === karte.id
                    ? null
                    : { spielerId: aktiver.id, karteId: karte.id },
                )

            return (
              <Kartenmarke
                key={karte.id}
                karte={karte}
                platz={platz + 1}
                vonWievielen={aktiver.hand.length}
                verdeckt={handModus === 'verdeckt'}
                gewaehlt={gewaehlt}
                variante={handModus === 'ueberhand' ? 'abwurf' : 'auswahl'}
                onWaehlen={onWaehlen}
                zusatz={
                  handModus === 'abwurfPflicht' && abwurfAktion === undefined
                    ? 'diese Art ist im Zug schon verbraucht'
                    : undefined
                }
              />
            )
          })}
        </ul>
        {handModus === 'ueberhand' ? (
          <button
            type="button"
            className="brett-knopf"
            onClick={handleUeberzaehligeKartenAbwerfen}
            disabled={abwurfAuswahl.length !== ueberhand}
          >
            {abwurfAuswahl.length} von {ueberhand} gewählt — abwerfen
          </button>
        ) : null}
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
        <span className="brett-status__pflicht">{pflichtschritt}</span>
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
