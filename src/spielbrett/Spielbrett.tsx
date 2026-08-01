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

import { Fragment, useState } from 'react'
import './spielbrett.css'
import { HANDKARTENLIMIT, MAX_KARTEN_PRO_ZUG, MAX_SCHLANGEN_PRO_SPIELER } from '../engine'
import type { SpielAktion } from '../engine'
import { gruppiereWirkungsgleicheAktionen } from '../aktionsGruppen'
import { waehleAngebot } from './aktionsangebot'
import { ermittleZielangebot, zielSchluessel } from './sonderkartenziele'
import type { Brettziel } from './sonderkartenziele'
import type { usePartie } from '../hooks/usePartie'
import useLegaleAktionenNachTyp from '../hooks/useLegaleAktionenNachTyp'
import { zugphaseLabel } from '../zugphaseLabels'
import Kartenmarke from './Kartenmarke'
import { ermittlePhasenSchritt } from './phasenSchritt'
import { findeAnlegeAktion, findeStartAktion, schlangenMitZiel } from './brettziele'
import { ermittleHandModus, handHinweis } from './handModus'
import { ermittleSpielerLagen, geheimeAufgabeDesMenschen } from './spielerLage'
import { reaktionsVerteidiger } from '../reaktionen'
import Haeutungseditor from './Haeutungseditor'
import { aufgabeLabel, naechsterPflichtschrittLabel } from '../spielLabelHelpers'

interface SpielbrettProps {
  partie: ReturnType<typeof usePartie>
}

/**
 * Wie viele Aktionen ohne gewählte Handkarte höchstens dastehen.
 *
 * Acht füllen die Seitenspalte etwa einmal. Darüber hinaus ist die Liste kein
 * Angebot mehr, sondern ein Katalog — gemessen waren es 45.
 */
const HOECHSTENS_ANGEBOTEN = 8

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
  /* Eine offene Reaktion blockiert jede andere Aktion — gleich, wem sie gehört.
     Angeboten wird sie aber nur dem Angegriffenen: Ist das eine KI, entscheidet
     sie selbst. Vorher stand hier nur `hatOffeneReaktion`, und das Brett fragte
     den Menschen, ob der *Gegner* seinen Farbenschutz einsetzen soll.

     Name und Zuständigkeit kommen aus *einem* Aufruf — getrennt ermittelt
     könnten sie auf verschiedene Spieler zeigen. */
  const hatOffeneReaktion = reaktionsAktionen.length > 0
  const verteidiger = reaktionsVerteidiger(zustand)
  const ichMussReagieren = verteidiger?.steuerung === 'Mensch'
  /* Das Reaktionsfenster gehört dem Angegriffenen: `spielerId` in der
     Reaktionsaktion ist der Verteidiger, nicht der Zugspieler. */
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
  const alleGruppen = gruppiereWirkungsgleicheAktionen(rohAktionen, aktiver.hand)
  /* Ohne Eingrenzung stand hier nach acht Runden eine 8886 px hohe Liste — jede
     Handkarte mal jedes Ziel. Siehe `aktionsangebot.ts`. */
  const angebot = waehleAngebot(alleGruppen, ausgewaehlteKarteId, HOECHSTENS_ANGEBOTEN)

  /* Brettziele zur gerade gewählten Handkarte. Ohne Auswahl ist alles leer —
     der Spieler wählt erst die Karte, dann das Ziel. */
  const startAktion = findeStartAktion(neueSchlangeStartenAktionen, ausgewaehlteKarteId)
  const zielSchlangen = schlangenMitZiel(karteAnlegenAktionen, ausgewaehlteKarteId)

  /* ÄNDERUNG [01.08.2026]: Sonderkarten wie Farbkarten spielen — Karte wählen,
     Ziel am Brett anklicken. Vorher ging das nur über die Aktionsliste, wo man
     aus vielen fast gleichlautenden Einträgen den mit dem richtigen Gegner
     heraussuchen musste.

     Mehrschrittige Karten (Schlangenfrass gegen zwei Gegner, Farbendieb mit
     Beute und Einfügeplatz) sammeln ihre Ziele hier; `sonderkartenziele.ts`
     sagt, was als Nächstes anklickbar ist. */
  /* Die Teilauswahl gehört zu *einer* Handkarte. Wechselt der Spieler die
     Karte, ist sie gegenstandslos — abgeleitet statt in einem Effekt
     zurückgesetzt, sonst rendert das Brett erst falsch und dann richtig. */
  const [zielauswahl, setZielauswahl] = useState<{ karteId: string; ziele: Brettziel[] }>({
    karteId: '',
    ziele: [],
  })
  const gewaehlteZiele = zielauswahl.karteId === ausgewaehlteKarteId ? zielauswahl.ziele : []

  const aktionenDerKarte =
    ausgewaehlteKarteId === null
      ? []
      : legaleAktionen.filter(
          (aktion) => 'handkartenId' in aktion && aktion.handkartenId === ausgewaehlteKarteId,
        )
  const zielangebot = ermittleZielangebot(aktionenDerKarte, gewaehlteZiele)
  const offeneSchluessel = new Set(zielangebot.offeneZiele.map(zielSchluessel))
  const gewaehlteSchluessel = new Set(gewaehlteZiele.map(zielSchluessel))

  /**
   * Ein Klick auf ein Brettziel.
   *
   * Ist die Auswahl damit vollständig, wird sofort gespielt — ein zusätzlicher
   * Bestätigungsklick fragt nichts (Regel 7). Sonst wartet sie auf das nächste
   * Ziel. Entschieden wird das hier und nicht in einem Effekt: Der Klick weiß
   * es bereits, und ein Effekt würde denselben Zustand zweimal rendern.
   */
  function zielAnklicken(ziel: Brettziel) {
    if (ausgewaehlteKarteId === null) return
    const naechste = [...gewaehlteZiele, ziel]
    const danach = ermittleZielangebot(aktionenDerKarte, naechste)
    if (danach.fertig !== null) {
      setZielauswahl({ karteId: ausgewaehlteKarteId, ziele: [] })
      fuhreAktionAus(danach.fertig)
      return
    }
    setZielauswahl({ karteId: ausgewaehlteKarteId, ziele: naechste })
  }

  /**
   * Was der nächste Klick bewirken soll.
   *
   * Ohne diesen Satz leuchten plötzlich Karten auf, und der Spieler rät, warum.
   * Der Text folgt der Art des angebotenen Ziels, nicht dem Kartennamen: Es
   * gibt weniger Zielarten als Karten, und die Zielart ist genau das, was der
   * Klick treffen soll.
   */
  const zielHinweis =
    zielangebot.offeneZiele.length === 0
      ? null
      : ({
          gegnerPlakette: 'Jetzt den Gegner anklicken, den es treffen soll.',
          gegnerSchlange: 'Jetzt die gegnerische Schlange anklicken.',
          eigeneSchlange: 'Jetzt die eigene Schlange anklicken.',
          karte:
            gewaehlteZiele.length === 0
              ? 'Jetzt eine leuchtende Karte anklicken.'
              : 'Jetzt die zweite Karte anklicken.',
          einfuegeplatz: 'Jetzt den Platz anklicken, an dem die Beute landen soll.',
        }[zielangebot.offeneZiele[0].art] ?? null)

  /** Ist dieses Ziel gerade anklickbar? */
  const istOffen = (ziel: Brettziel) => offeneSchluessel.has(zielSchluessel(ziel))
  /** Wurde es im laufenden Mehrschritt schon gewählt? */
  const istGewaehlt = (ziel: Brettziel) => gewaehlteSchluessel.has(zielSchluessel(ziel))

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
          const eigeneSchlangeZiel: Brettziel = { art: 'eigeneSchlange', schlangenId: schlange.id }
          const karteZiel = (kartenId: string): Brettziel => ({
            art: 'karte',
            spielerId: aktiver.id,
            schlangenId: schlange.id,
            kartenId,
          })
          const platzZiel = (position: number): Brettziel => ({
            art: 'einfuegeplatz',
            schlangenId: schlange.id,
            index: position,
          })
          return (
            <div
              key={schlange.id}
              className={`brett-schlange${zielSchlangen.has(schlange.id) || istOffen(eigeneSchlangeZiel) ? ' brett-schlange--ziel' : ''}`}
            >
              {/* Die ganze Schlange als Ziel — Farbenschutz. Nur sichtbar,
                  wenn die gewählte Karte das gerade anbietet. */}
              {istOffen(eigeneSchlangeZiel) ? (
                <button
                  type="button"
                  className="brett-anlegeplatz brett-anlegeplatz--ziel"
                  onClick={() => zielAnklicken(eigeneSchlangeZiel)}
                >
                  {index + 1}. Schlange wählen
                </button>
              ) : (
                <span className="brett-schlange__marke">
                  {index + 1}. Schlange · {schlange.zustand}
                </span>
              )}
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
                {schlange.karten.map((karte, kartenIndex) => (
                  <Fragment key={karte.id}>
                    {/* Einfügeplätze erscheinen nur, wenn eine Karte sie
                        anbietet (Farbendieb) — sonst stünden hier bei jeder
                        Schlange n+1 Knöpfe ohne Zweck. */}
                    {istOffen(platzZiel(kartenIndex)) ? (
                      <li>
                        <button
                          type="button"
                          className="brett-anlegeplatz brett-anlegeplatz--ziel brett-anlegeplatz--schmal"
                          aria-label={`Hier einfügen, vor Karte ${kartenIndex + 1}`}
                          onClick={() => zielAnklicken(platzZiel(kartenIndex))}
                        >
                          ＋
                        </button>
                      </li>
                    ) : null}
                    <Kartenmarke
                      karte={karte}
                      platz={kartenIndex + 1}
                      vonWievielen={schlange.karten.length}
                      gewaehlt={istGewaehlt(karteZiel(karte.id))}
                      variante={istOffen(karteZiel(karte.id)) ? 'ziel' : 'auswahl'}
                      onWaehlen={istOffen(karteZiel(karte.id)) ? () => zielAnklicken(karteZiel(karte.id)) : undefined}
                    />
                  </Fragment>
                ))}
                {istOffen(platzZiel(schlange.karten.length)) ? (
                  <li>
                    <button
                      type="button"
                      className="brett-anlegeplatz brett-anlegeplatz--ziel brett-anlegeplatz--schmal"
                      aria-label="Hier einfügen, ans Ende"
                      onClick={() => zielAnklicken(platzZiel(schlange.karten.length))}
                    >
                      ＋
                    </button>
                  </li>
                ) : null}
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
        {/* Die Punkte hier sind die öffentlich bekannten. Ohne diesen Zusatz
            läse man sie als Endstand — und wunderte sich in der Schlusswertung. */}
        <h2 className="brett-bereich__titel">Gegner · Punkte ohne geheime Aufgaben</h2>
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
                    {/* Die Plakette des Gegners ist selbst ein Ziel — Schlangengrube. */}
                    {istOffen({ art: 'gegnerPlakette', spielerId: spieler.id }) ? (
                      <button
                        type="button"
                        className="brett-anlegeplatz brett-anlegeplatz--ziel brett-anlegeplatz--schmal"
                        onClick={() => zielAnklicken({ art: 'gegnerPlakette', spielerId: spieler.id })}
                      >
                        {spieler.name} treffen
                      </button>
                    ) : (
                      <span className="brett-kopf__wert">{spieler.name}</span>
                    )}
                    <span className="brett-kopf__leise">
                      {lage?.punkte ?? 0} Punkte · {spieler.hand.length} Karten
                    </span>
                    {/* Wer aussetzt, stand vor diesem Paket nirgends im Brett. */}
                    {lage?.setztAus ? <span className="brett-kopf__warnung">setzt aus</span> : null}
                  </span>
                  {spieler.schlangen.length === 0 ? (
                    <span className="brett-leer">noch keine Schlange</span>
                  ) : (
                    spieler.schlangen.map((schlange, schlangenIndex) => {
                      const schlangeZiel: Brettziel = {
                        art: 'gegnerSchlange',
                        spielerId: spieler.id,
                        schlangenId: schlange.id,
                      }
                      const karteZiel = (kartenId: string): Brettziel => ({
                        art: 'karte',
                        spielerId: spieler.id,
                        schlangenId: schlange.id,
                        kartenId,
                      })
                      return (
                        <Fragment key={schlange.id}>
                          {/* Die ganze gegnerische Schlange als Ziel — Schlangenblockade.
                              Die Engine kennt dafür keine Einfügeposition. */}
                          {istOffen(schlangeZiel) ? (
                            <button
                              type="button"
                              className="brett-anlegeplatz brett-anlegeplatz--ziel brett-anlegeplatz--schmal"
                              onClick={() => zielAnklicken(schlangeZiel)}
                            >
                              {schlangenIndex + 1}. Schlange blockieren
                            </button>
                          ) : null}
                          <ul className="brett-hand__karten">
                            {schlange.karten.map((karte, kartenIndex) => (
                              <Kartenmarke
                                key={karte.id}
                                karte={karte}
                                platz={kartenIndex + 1}
                                vonWievielen={schlange.karten.length}
                                gewaehlt={istGewaehlt(karteZiel(karte.id))}
                                variante={istOffen(karteZiel(karte.id)) ? 'ziel' : 'auswahl'}
                                onWaehlen={
                                  istOffen(karteZiel(karte.id))
                                    ? () => zielAnklicken(karteZiel(karte.id))
                                    : undefined
                                }
                              />
                            ))}
                          </ul>
                        </Fragment>
                      )
                    })
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
          {ichMussReagieren ? 'Du wirst angegriffen' : 'Mögliche Aktionen'}
        </h2>
        {/* Wartet das Brett auf jemand anderen, ist die leere Liste kein
            Rätsel, sondern erklärt. Vorher stand hier nur „ist am Zug" für den
            Gegnerzug — beim Angriff auf eine KI blieb „Mögliche Aktionen" über
            einer leeren Liste stehen. */}
        {hatOffeneReaktion && !ichMussReagieren ? (
          <p className="brett-leer">{verteidiger?.name ?? 'Der Gegner'} entscheidet gerade.</p>
        ) : istKiAmZug ? (
          <p className="brett-leer">{aktiver.name} ist am Zug.</p>
        ) : angebot.eintraege.length === 0 ? (
          <p className="brett-leer">Gerade keine Aktion möglich.</p>
        ) : (
          <ul className="brett-aktionsliste">
            {angebot.eintraege.map((gruppe, index) => (
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
        {/* Kein stiller Deckel: Wer kürzt, sagt es und sagt, wie man weiterkommt. */}
        {angebot.weitere > 0 ? (
          <p className="brett-aktionsliste__rest">
            … und {angebot.weitere} weitere. Wähle eine Handkarte, um nur ihre Aktionen zu sehen.
          </p>
        ) : null}
        {angebot.aufKarteGefiltert ? (
          <p className="brett-aktionsliste__rest">Nur die Aktionen der gewählten Karte.</p>
        ) : null}

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
            Anzeigefehler, sondern ein Regelbruch. Seit dem 01.08.2026 gilt das
            auch für ihre Punkte: Sie stehen in keiner laufenden Punktzahl, sonst
            verriete der Sprung, welche Aufgabe ein Gegner erfüllt hat. Deshalb
            steht hier, was die eigene wert ist. */}
        {geheimeAufgabe ? (
          <p className="brett-geheimaufgabe">
            <span className="brett-bereich__titel">Deine geheime Aufgabe · {geheimeAufgabe.punkte} Punkte</span>
            <span>{geheimeAufgabe.text}</span>
            <span className="brett-geheimaufgabe__stand">
              {geheimeAufgabe.erfuellt
                ? '✓ erfüllt — zählt in der Schlusswertung'
                : 'zählt erst in der Schlusswertung'}
            </span>
          </p>
        ) : null}
      </section>

      {/* 5 — Handleiste. Der Klick bedeutet je nach Modus etwas anderes; der
          Hinweis darüber sagt, was gerade gilt. */}
      <section className="brett-hand brett-bereich" aria-label="Deine Hand">
        <h2 className="brett-bereich__titel">Deine Hand</h2>
        {hinweis ? <p className="brett-hand__hinweis">{hinweis}</p> : null}
        {/* Mehrschrittige Sonderkarten sagen, was der nächste Klick tun soll —
            sonst rät man, warum plötzlich Karten leuchten. */}
        {zielHinweis ? <p className="brett-hand__hinweis">{zielHinweis}</p> : null}
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
        {/* Der eigene Fall zuerst — dann braucht kein Zweig eine Negation des
            anderen mitzudenken. Genau diese Falle hat den Fehler erzeugt. */}
        {ichMussReagieren ? (
          <div className="brett-reaktion" role="group" aria-label="Angriff abwehren">
            <span className="brett-hand__hinweis">Du wirst angegriffen — deine Entscheidung</span>
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
        ) : hatOffeneReaktion ? (
          /* Der Angegriffene ist eine KI — sie entscheidet gleich selbst. */
          <p className="brett-leer" role="status" aria-live="polite">
            {verteidiger?.name ?? 'Der Gegner'} überlegt …
          </p>
        ) : istKiAmZug ? (
          <p className="brett-leer" role="status" aria-live="polite">
            {aktiver.name} spielt …
          </p>
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
