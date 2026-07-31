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

import { useState } from 'react'
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
import Haeutungseditor from './Haeutungseditor'
import { aufgabeLabel, naechsterPflichtschrittLabel } from '../spielLabelHelpers'

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
    handleUeberzaehligeKartenAbwerfen,
    handleZugAbschliessen,
    kiZugProtokoll,
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
  /* Das Reaktionsfenster gehört dem Angegriffenen: `spielerId` in der
     Reaktionsaktion ist der Verteidiger, nicht der Zugspieler. */
  const reaktionsVerteidiger =
    hatOffeneReaktion && 'spielerId' in reaktionsAktionen[0]
      ? zustand.spieler.find((spieler) => spieler.id === reaktionsAktionen[0].spielerId)?.name
      : undefined
  const schritt = ermittlePhasenSchritt(zustand, ueberhand, hatOffeneReaktion)

  const ausgewaehlteKarteId =
    ausgewaehlteHandkarteAuswahl?.spielerId === aktiver.id ? ausgewaehlteHandkarteAuswahl.karteId : null

  /* Solange eine Reaktion offen ist, lehnt die Engine jede andere Aktion ab.
     Die Reaktion selbst steht aber nicht hier, sondern in Region 6 — sie ist
     das, was den Zug voranbringt, und würde an beiden Orten gegen Regel 1
     verstoßen. */
  const rohAktionen: SpielAktion[] = hatOffeneReaktion ? [] : legaleAktionen
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
  const istEndspurt = zustand.spielphase === 'Endspurt'
  /* Die Schlangenhäutung ist die einzige Aktion, die die Engine nicht
     enumeriert — die Reihenfolge muss die Oberfläche anbieten. */
  const [haeutungFuerSchlange, setHaeutungFuerSchlange] = useState<string | null>(null)
  const haeutungskarte = aktiver.hand.find(
    (karte) => karte.typ === 'Sonderkarte' && karte.name === 'Schlangenhäutung',
  )
  const pflichtschritt = naechsterPflichtschrittLabel(
    zustand,
    legaleAktionen,
    nichtEnumerierteAktionenHinweise,
    ueberhand,
  )

  function schrittAusloesen() {
    if (schritt === null) return
    switch (schritt.schluessel) {
      case 'ueberzaehligeAbwerfen': return handleUeberzaehligeKartenAbwerfen()
      case 'zugAbschliessen': return handleZugAbschliessen()
    }
  }

  return (
    <main className="spielbrett">
      {/* 1 — Kopfleiste */}
      <section className="brett-kopf brett-bereich" aria-label="Spielstand">
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
        {istEndspurt ? (
          <p className="brett-kopf__warnung">Endspurt — Aufgaben zählen doppelt</p>
        ) : null}
        {eigeneLage?.setztAus ? (
          <p className="brett-kopf__warnung">Du setzt aus — Schlangengrube</p>
        ) : null}
      </section>

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

              {/* Häutung: nur mit der Karte auf der Hand, an einer aktiven
                  Schlange mit mindestens zwei Karten. */}
              {haeutungskarte && schlange.zustand === 'aktiv' && schlange.karten.length > 1 ? (
                <button
                  type="button"
                  className="brett-knopf brett-knopf--leise"
                  onClick={() =>
                    setHaeutungFuerSchlange((aktuell) => (aktuell === schlange.id ? null : schlange.id))
                  }
                >
                  {haeutungFuerSchlange === schlange.id ? 'Häutung schließen' : 'Häuten'}
                </button>
              ) : null}

              {haeutungFuerSchlange === schlange.id && haeutungskarte ? (
                <Haeutungseditor
                  zustand={zustand}
                  schlange={schlange}
                  handkartenId={haeutungskarte.id}
                  onAusfuehren={(aktion) => {
                    setHaeutungFuerSchlange(null)
                    fuhreAktionAus(aktion)
                  }}
                  onAbbrechen={() => setHaeutungFuerSchlange(null)}
                />
              ) : null}
            </div>
          )
        })}
      </section>

      {/* 3 — Gegnerstreifen. Die Schlangen der Gegner folgen in G-6. */}
      <section className="brett-gegner brett-bereich" aria-label="Gegner">
        <h2 className="brett-bereich__titel">Gegner</h2>
        {/* Läuft der Gegnerzug ohne Klick durch, ist dieses Protokoll die
            einzige Stelle, an der der Spieler erfährt, was passiert ist. */}
        {kiZugProtokoll.length > 0 ? (
          <ol className="brett-gegner__protokoll" aria-label="Was der Gegner getan hat">
            {kiZugProtokoll.map((zeile, index) => (
              <li key={`${index}-${zeile}`}>{zeile}</li>
            ))}
          </ol>
        ) : null}
        <ul className="brett-gegner__liste">
          {zustand.spieler
            .filter((spieler) => spieler.id !== aktiver.id)
            .map((spieler) => {
              const lage = lagen.find((eintrag) => eintrag.id === spieler.id)
              return (
                <li key={spieler.id} className="brett-gegner__spieler">
                  <span className="brett-kopf__block">
                    <span className="brett-kopf__wert">{spieler.name}</span>
                    <span className="brett-kopf__leise">
                      {lage?.punkte ?? 0} Punkte · {spieler.hand.length} Karten
                    </span>
                    {/* Wer aussetzt, stand vor diesem Paket nirgends im Brett. */}
                    {lage?.setztAus ? <span className="brett-kopf__warnung">setzt aus</span> : null}
                  </span>
                  {spieler.schlangen.length === 0 ? (
                    <span className="brett-leer">noch keine Schlange</span>
                  ) : (
                    spieler.schlangen.map((schlange) => (
                      <ul key={schlange.id} className="brett-hand__karten">
                        {schlange.karten.map((karte) => (
                          <Kartenmarke key={karte.id} karte={karte} />
                        ))}
                      </ul>
                    ))
                  )}
                </li>
              )
            })}
        </ul>
      </section>

      {/* 4 — Seitenspalte. Die Aktionsliste steht bewusst zuoberst: Die Spalte
          scrollt, und der Wächter „kein Bedienelement verdeckt" hat prompt
          gemeldet, als die empfohlene Aktion unter die Aufgabenliste rutschte
          und damit unerreichbar wurde. Was man anklickt, kommt zuerst; was man
          nachschlägt, danach. */}
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

        {/* Offene Aufgaben als *Liste*. Die Tafel auf /game meldete
            „3 offene Aufgaben" und blendete ihren Inhalt per App.css:3867 aus —
            der Spieler erfuhr nie, worum es geht. */}
        <div className="brett-aufgaben">
          <span className="brett-bereich__titel">
            Offene Aufgaben · {zustand.offeneAufgaben.length}
            {istEndspurt ? ' · zählen doppelt' : ''}
          </span>
          {zustand.offeneAufgaben.length === 0 ? (
            <span className="brett-leer">keine offenen Aufgaben</span>
          ) : (
            <ul>
              {zustand.offeneAufgaben.map((aufgabe) => (
                <li key={aufgabe.id} className="brett-aufgaben__eintrag">
                  {aufgabeLabel(aufgabe, istEndspurt)}
                </li>
              ))}
            </ul>
          )}
          <span className="brett-leer">Aufgabenstapel: {zustand.aufgabenStapel.length}</span>
        </div>

        {/* Nur die eigene geheime Aufgabe — die einer KI zu zeigen wäre kein
            Anzeigefehler, sondern ein Regelbruch. */}
        {geheimeAufgabe ? (
          <p className="brett-geheimaufgabe">
            <span className="brett-bereich__titel">Deine geheime Aufgabe</span>
            <span>{geheimeAufgabe.text}</span>
            {geheimeAufgabe.erfuellt ? <span className="brett-kopf__wert">✓ erfüllt</span> : null}
          </p>
        ) : null}
      </section>

      {/* 5 — Handleiste. Der Klick bedeutet je nach Modus etwas anderes; der
          Hinweis darüber sagt, was gerade gilt. */}
      <section className="brett-hand brett-bereich" aria-label="Deine Hand">
        <h2 className="brett-bereich__titel">Deine Hand</h2>
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

      {/* 6 — der eine Knopf, der den Zug voranbringt. Eine offene Reaktion hat
          Vorrang: Sie blockiert das ganze Spiel, bis der *Verteidiger*
          entschieden hat — nicht der Spieler, der am Zug ist. */}
      <section className="brett-aktion brett-bereich" aria-label="Zugaktion">
        {istKiAmZug && !hatOffeneReaktion ? (
          <p className="brett-leer" role="status" aria-live="polite">
            {aktiver.name} spielt …
          </p>
        ) : hatOffeneReaktion ? (
          <div className="brett-reaktion" role="group" aria-label="Angriff abwehren">
            <span className="brett-hand__hinweis">
              {reaktionsVerteidiger ?? 'Ein Spieler'} wird angegriffen — Entscheidung nötig
            </span>
            {reaktionsAktionen.map((aktion, index) => (
              <button
                key={`${aktion.typ}-${index}`}
                type="button"
                className={`brett-knopf${index === 0 ? '' : ' brett-knopf--leise'}`}
                onClick={() => fuhreAktionAus(aktion)}
              >
                {aktionsLabel(aktion)}
              </button>
            ))}
            {/* Ohne Farbenschutzkarte bietet die Engine nur „durchlassen" an. */}
            {reaktionsAktionen.length === 1 ? (
              <span className="brett-leer">Kein Farbenschutz auf der Hand.</span>
            ) : null}
          </div>
        ) : schritt === null ? (
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
      <section className="brett-status brett-bereich" aria-label="Spielverlauf">
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
      </section>
    </main>
  )
}
