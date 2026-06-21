/*
Author: rahn
Datum: 18.06.2026
Version: 1.0
Beschreibung: Material-und-Aufgaben-HUD mit Stitch-Materialrucksack, Aufgabenkarten und Entwicklungsdaten.
*/

import { useId } from 'react'
import {
  erstelleErweiterungsSonderkarten,
  erstelleSonderkarten,
} from '../engine'
import type { AufgabenkarteInfo, Spielzustand } from '../engine'
import DebugGruppe from './DebugGruppe'

interface MaterialUndAufgabenPanelProps {
  zustand: Spielzustand
  istEndspurt: boolean
  entwicklungsdatenOffen?: boolean
  brettFokus?: boolean
}

function kartenIds(karten: { id: string }[]): string {
  return karten.map(k => k.id).join(', ')
}

function aufgabenPunkteAnzeige(a: AufgabenkarteInfo, istEndspurt: boolean): string {
  if (!istEndspurt) return `${a.punkte} Punkte`
  return `${a.punkte} Punkte ×2 = ${a.punkte * 2} Punkte`
}

function aufgabeLabel(a: AufgabenkarteInfo, istEndspurt: boolean): string {
  return `${a.name} (${aufgabenPunkteAnzeige(a, istEndspurt)}): ${a.bedingung}`
}

function sonderkartenLabel(karten: { name: string }[]): string {
  const gruppen = new Map<string, number>()
  for (const karte of karten) {
    gruppen.set(karte.name, (gruppen.get(karte.name) ?? 0) + 1)
  }

  return Array.from(gruppen.entries())
    .map(([name, anzahl]) => `${anzahl} ${name}`)
    .join(', ')
}

const BASIS_SONDERKARTEN = erstelleSonderkarten()
const ERWEITERUNGS_SONDERKARTEN = erstelleErweiterungsSonderkarten()
const BASIS_SONDERKARTEN_LABEL = sonderkartenLabel(BASIS_SONDERKARTEN)
const ERWEITERUNGS_SONDERKARTEN_LABEL = sonderkartenLabel(ERWEITERUNGS_SONDERKARTEN)
const SONDERKARTEN_ZAUBER_ANZAHL = BASIS_SONDERKARTEN.length + ERWEITERUNGS_SONDERKARTEN.length

export default function MaterialUndAufgabenPanel({ zustand, istEndspurt, entwicklungsdatenOffen = true, brettFokus = false }: MaterialUndAufgabenPanelProps) {
  const materialUndAufgabenTitelId = useId()
  const aufgabenkartenTitelId = useId()
  if (brettFokus) return null

  return (
    <section className="info-panel info-panel--material waldtanz-hud waldtanz-hud--material material-aufgaben-panel--brettfokus" aria-labelledby={materialUndAufgabenTitelId} aria-live="polite" aria-atomic="true">
      <h2 id={materialUndAufgabenTitelId}>Material und Aufgaben</h2>
      <section className="materialrucksack" aria-label="Waldtanz-Materialrucksack">
        <div className="materialrucksack__kopf">
          <span className="materialrucksack__icon" aria-hidden="true">🎒</span>
          <div>
            <h3>Materialrucksack</h3>
            <p>Alles griffbereit für den nächsten Waldzug.</p>
          </div>
        </div>
        <dl className="materialrucksack__chips" aria-label="Materialwerte">
          <div className="materialrucksack__chip">
            <dt>Nachziehstapel</dt>
            <dd>{zustand.nachziehstapel.length} Karten</dd>
          </div>
          <div className="materialrucksack__chip">
            <dt>Ablage</dt>
            <dd>{zustand.ablagestapel.length} Karten</dd>
          </div>
          <div className="materialrucksack__chip">
            <dt>Aufgabenstapel</dt>
            <dd>{zustand.aufgabenStapel.length} Karten</dd>
          </div>
          <div className="materialrucksack__chip materialrucksack__chip--gold">
            <dt>Offene Aufgaben</dt>
            <dd>{zustand.offeneAufgaben.length} Quests</dd>
          </div>
          <div className="materialrucksack__chip materialrucksack__chip--zauber">
            <dt>Sonderkarten-Zauber</dt>
            <dd>{SONDERKARTEN_ZAUBER_ANZAHL} Karten</dd>
          </div>
        </dl>
      </section>
      <section className="aufgabenkarten-bereich" aria-labelledby={aufgabenkartenTitelId} aria-live="polite" aria-atomic="true">
        <h3 id={aufgabenkartenTitelId}>Aufgabenkarten</h3>
        {zustand.offeneAufgaben.length === 0 ? (
          <p>Keine offenen Aufgabenkarten.</p>
        ) : (
          <ul className="aufgabenkarten-liste">
            {zustand.offeneAufgaben.map(a => (
              <li key={a.id} className="aufgabenkarte">
                <strong>{a.name}</strong>
                <span>{aufgabenPunkteAnzeige(a, istEndspurt)}</span>
                <span>{a.bedingung}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <DebugGruppe titel="Karten und Aufgaben" standardOffen={entwicklungsdatenOffen} kompakteSchublade={!entwicklungsdatenOffen}>
        <p>Karten im Ablagestapel: {zustand.ablagestapel.length} Karten</p>
        <p>Karten auf dem Ablagestapel: {zustand.ablagestapel.length > 0 ? kartenIds(zustand.ablagestapel) : 'keine'}</p>
        <p>Karten im Nachziehstapel: {zustand.nachziehstapel.length} Karten</p>
        <p>Spielmaterial insgesamt: {zustand.nachziehstapel.length + zustand.ablagestapel.length} Karten</p>
        <p>Basis-Sonderkarten: {BASIS_SONDERKARTEN_LABEL}</p>
        <p>Erweiterungs-Sonderkarten: {ERWEITERUNGS_SONDERKARTEN_LABEL}</p>
        <p>Aufgaben im Stapel: {zustand.aufgabenStapel.length} Karten</p>
        <p>
          Aktuelle Aufgaben:{' '}
          {zustand.offeneAufgaben.length > 0
            ? zustand.offeneAufgaben.map(a => `${a.name} (${aufgabenPunkteAnzeige(a, istEndspurt)})`).join(', ')
            : 'keine'}
        </p>
        <p>
          Aufgabenziele:{' '}
          {zustand.offeneAufgaben.length > 0
            ? zustand.offeneAufgaben.map(a => aufgabeLabel(a, istEndspurt)).join('; ')
            : 'keine'}
        </p>
      </DebugGruppe>
    </section>
  )
}
