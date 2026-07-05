/*
Author: rahn
Datum: 21.06.2026
Version: 1.0
Beschreibung: Eigener Debug-Block fuer "Aktiver Spieler" innerhalb des
              Spieltischs. Wird aus App.tsx extrahiert, damit App.tsx unter
              dem harten 500-Zeilen-Budget bleibt. Reine Presentation.
*/

import DebugGruppe from './DebugGruppe'
import { aktionsLabel } from '../aktionsLabel'
import { HANDKARTENLIMIT } from '../engine/constants'
import type { SpielAktion, Spieler, SpielerWertungsEintrag } from '../engine'

interface WaldtanzAktiverSpielerDebugProps {
  aktiverSpieler: Spieler
  aktiverSpielerWertung: SpielerWertungsEintrag | null | undefined
  legaleAktionen: readonly SpielAktion[]
  reaktionsAktionen: readonly SpielAktion[]
  letzteAktion: string | null
  istSpielende: boolean
  gewinnerText: string
  empfohleneAktionLabel: string
  ueberhand: number
  pflichtschrittLabel: string
  zugfuehrungLabel: string
  geheimerAufgabeLabel: string
  standardOffen: boolean
  kompakteSchublade: boolean
}

export default function WaldtanzAktiverSpielerDebug({
  aktiverSpieler,
  aktiverSpielerWertung,
  legaleAktionen,
  reaktionsAktionen,
  letzteAktion,
  istSpielende,
  gewinnerText,
  empfohleneAktionLabel,
  ueberhand,
  pflichtschrittLabel,
  zugfuehrungLabel,
  geheimerAufgabeLabel,
  standardOffen,
  kompakteSchublade,
}: WaldtanzAktiverSpielerDebugProps) {
  return (
    <DebugGruppe titel="Aktiver Spieler" standardOffen={standardOffen} kompakteSchublade={kompakteSchublade}>
      <p>Aktiver Spieler: {aktiverSpieler.name}</p>
      <p>Spielerprofil: {aktiverSpieler.name} — {zugfuehrungLabel}</p>
      <p>Zugführung: {zugfuehrungLabel}</p>
      <p>Aktueller Punktestand: {aktiverSpielerWertung ? `${aktiverSpielerWertung.gesamtPunkte} Punkte` : 'keine'}</p>
      {ueberhand > 0 && <p>Überzählige Karten: {ueberhand} über dem Limit von {HANDKARTENLIMIT}.</p>}
      {letzteAktion && <p>Zuletzt ausgeführt: {letzteAktion}</p>}
      {istSpielende && (
        <>
          <p>Spielende erreicht.</p>
          <p>Gewinner: {gewinnerText}</p>
        </>
      )}
      {/* H3: Die konkrete empfohlene Aktion (mit Kartendaten) nur für den Menschen zeigen,
          nie für eine aktive KI (verdeckte Handinformation). */}
      {!istSpielende && aktiverSpieler.steuerung === 'Mensch' && legaleAktionen.length > 0 && <p>Empfohlene Aktion: {empfohleneAktionLabel}</p>}
      {reaktionsAktionen.length > 0 && <p>Nächste Reaktionsaktion: {aktionsLabel(reaktionsAktionen[0])}</p>}
      <p>Nächster Pflichtschritt: {pflichtschrittLabel}</p>
      <p>Geheime Aufgabe: {geheimerAufgabeLabel}</p>
    </DebugGruppe>
  )
}