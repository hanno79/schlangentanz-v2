---
id: TF-ENGINE-027
titel: Wehrt bei einer Karte gegen zwei Mitspieler nur einer ab, nennt KartenVersetzt nur die Karte des anderen, und die Lage lässt sich nachrechnen.
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

Nach einer Ansage entscheidet jeder Betroffene einzeln (A6). Wehrt nur ein Teil ab, wirkt die Karte für die anderen (A7.2). Das Ereignis muss auch dann genau das Bewegte nennen, und der Farbenschutz des Abwehrenden liegt schon auf dessen Ablagestapel, bevor die Karte wirkt.

## Bestanden, wenn

Im Ablauf stehen ein `Abgewehrt` und genau ein `KartenVersetzt`, direkt vor `AnsageEntschieden`. Es nennt nur die Karte von Spieler 3 (`schlange-2`, Stelle 1) mit Ziel Ablagestapel von Spieler 1, Stelle 0. Die Karte von Spieler 2 bleibt in `schlange-1`. `spieleNach` ergibt nach jedem Schritt die Lage des neuen Zustands, kein Ereignis nennt eine Handkarte, alle Invarianten sind erfüllt.

## Fehlgeschlagen, wenn

Das Ereignis auch die Karte von Spieler 2 nennt, fehlt, nach `AnsageEntschieden` steht oder das Nachrechnen eine andere Lage ergibt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf dem geprüften Stand von `task/E4b-versetzt`, `npm ci` gelaufen |

## Testdaten

Drei Spieler mit Erweiterung. Spieler 1 hält Schlangenfrass und Blau, Spieler 2 Farbenschutz, Rot, Gelb, Blau, Rot und die Schlange Blau, Rot, Spieler 3 Blau, Rot, Gelb, Blau, Rot und die Schlange Gelb, Grün, Rot. Die Test-Karte trifft Spieler 2 und 3 und nimmt je Nicht-Abwehrendem die genannte Karte auf den Ablagestapel von Spieler 1. Spieler 2 wehrt ab, Spieler 3 lässt durch. Die Prüfdatei liegt dem Lauf als Beleg bei (Test „P1“).

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Konsole im Repo | Prüfdatei aus dem Beleg als `src/engine/__tests__/zz_pruefer_e4b_probe.test.ts` anlegen | Inhalt des Belegs | Datei liegt neben `kartenversetzt.test.ts` |
| 2 | Konsole im Repo | Test P1 ausführen | `npx vitest run src/engine/__tests__/zz_pruefer_e4b_probe.test.ts -t P1` | Exit 0, „P1 teilweise abgewehrt“ bestanden |
| 3 | Konsole im Repo | Prüfdatei wieder löschen | | `git status` zeigt nichts |
