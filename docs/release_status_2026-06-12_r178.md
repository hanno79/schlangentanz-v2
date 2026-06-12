# Release-Status R178 — Board-Zielmarkierungen

Datum: 12.06.2026  
Autor: rahn  
Version: R178

## Ziel

R178 beendet die mechanische A11y-Mikroslice-Schleife weiter und stärkt die echte Kartenspiel-Interaktion auf dem Spielbrett: Nach Auswahl einer Handkarte werden direkte, legale Board-Ziele sichtbar markiert.

## Umgesetzt

- Startzone erhält nach Auswahl einer legal startbaren Farbkarte die Klasse `schlangen-startzone--zielbereit`.
- Eigene Schlange erhält nach Auswahl einer legal anlegbaren Farbkarte die Klasse `schlangekarte--zielbereit`.
- Sichtbare Zielhinweise ergänzt:
  - `Ausgewählte Karte hier als neue Schlange starten.`
  - `Ausgewählte Karte hier anlegen.`
- Sonderkarten erzeugen keine falschen Farbkarten-Zielmarkierungen.
- Startzonen-Klick mit ausgewählter unpassender Karte führt keine fremde Fallback-Aktion aus.
- CSS-Zielmarkierung hinter Basisflächen platziert, damit die sichtbare Hervorhebung nicht durch spätere Regeln überdeckt wird.

## Geänderte Dateien

- `src/App.r178_board_zielmarkierungen.test.tsx`
- `src/components/Schlangenbereich.tsx`
- `src/App.css`

## Verifikation

- RED beobachtet:
  - R178-Test schlug zunächst fehl, weil nach Handkartenauswahl keine Board-Zielklassen gesetzt wurden.
  - Nach Codex-Review zusätzlich RED für Sonderkarten-False-Positive beobachtet.
- Targeted Tests:
  - `src/App.r178_board_zielmarkierungen.test.tsx`
  - `src/App.f36_drag_drop_schlange.test.tsx`
  - `src/App.f36_drag_drop_schlange_status.test.tsx`
  - Ergebnis: 23 Tests bestanden.
- Vollsuite:
  - 184 Testdateien bestanden.
  - 674 Tests bestanden.
- Qualitätsgates:
  - `npm run check:test-lines` bestanden.
  - `npm run typecheck` bestanden.
  - `npm run lint` bestanden.
  - `npm run build` bestanden.
  - `git diff --check` bestanden.
- Codex Review:
  - Erster Review fand zwei echte Blocker: Sonderkarten-False-Positive und CSS-Kaskade.
  - Beide Blocker wurden behoben.
  - Finaler Review: `BLOCKERS: none`.
- Lokaler Smoke:
  - HTTP 200 für `/` und `/game`.
  - Kernregionen sichtbar: Spielstatus, Aktiver Spieler, Spieltisch, Handkarten, Schlangenbereich, Aktionen.
  - Startzonen-Zielmarkierung nach Handkartenauswahl sichtbar.
  - Keine Console-/Page-Fehler.

## Bekannter Blocker außerhalb R178

Claude Code `/simplify`/Coding-Pass bleibt wegen `401 Invalid authentication credentials` blockiert. R178 wurde deshalb mit engem manuellem TDD-Fallback plus Codex Review umgesetzt.
