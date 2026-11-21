---
id: TF-ENGINE-028
titel: Ändert eine Wirkung gleichzeitig Schlangen zweier Spieler, eine Fusion samt Unterkarten und den Ablagestapel, lässt sich die Lage aus KartenVersetzt nachrechnen.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/E4b-versetzt (PR #63)
grenzfall_von: TF-ENGINE-026
---

## Worum es geht

Die Tests des Umsetzers bewegen je Wirkung höchstens eine Art von Karte. Hier ändert eine einzige Wirkung alles auf einmal: Eine Fusion wandert mit ihren zwei Unterkarten in die Schlange eines anderen Spielers, die eigene Schlange wird umgeordnet, und die unterste Karte des Ablagestapels geht in die fremde Schlange. Dazu eine Drehung in einer Schlange, bei der jede Karte die Stelle wechselt.

## Bestanden, wenn

- P2: Die eigene Schlange lautet danach Gelb, Fusion, Blau, Rot, die fremde endet mit der früher untersten Ablagekarte. Das Ereignis nennt die Fusion (Schlange nach Schlange), die Ablagekarte (Ablagestapel nach Schlange) und genau zwei Unterkarten mit Ziel unter der Fusion bei Spieler 1. `spieleNach` ergibt nach jedem Schritt die Lage des neuen Zustands.
- P3: Die Drehung A, B, C, D zu B, C, D, A lässt sich nachrechnen.

## Fehlgeschlagen, wenn

`spieleNach` eine andere Lage ergibt, etwa die Fusion ohne Unterkarten oder Karten an falscher Stelle.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf dem geprüften Stand von `task/E4b-versetzt`, `npm ci` gelaufen |

## Testdaten

P2: zwei Spieler mit Erweiterung, Spieler 1 mit Schlange Blau, Rot, Gelb und Ablagestapel Violett, Grün; Spieler 2 mit Schlange Grün, Fusion auf Gelb und Gelb, Rot. P3: Schlange Blau, Rot, Gelb, Grün von Spieler 1. Die Prüfdatei liegt dem Lauf als Beleg bei (Tests „P2“ und „P3“).

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Konsole im Repo | Prüfdatei aus dem Beleg als `src/engine/__tests__/zz_pruefer_e4b_probe.test.ts` anlegen | Inhalt des Belegs | Datei liegt neben `kartenversetzt.test.ts` |
| 2 | Konsole im Repo | Tests P2 und P3 ausführen | `npx vitest run src/engine/__tests__/zz_pruefer_e4b_probe.test.ts -t "P2\|P3"` | Exit 0, beide bestanden |
| 3 | Konsole im Repo | Prüfdatei wieder löschen | | `git status` zeigt nichts |
