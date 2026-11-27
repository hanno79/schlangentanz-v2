---
id: TF-TISCH-046
titel: Gegnerzug, Angriff und Abwehr werden vom Ansager vorgelesen, und kein zweiter Bereich liest dasselbe vor.
art: manuell
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-25
veraendert_daten: ja
aenderung: task/O11-barrierefreiheit (PR #121)
---

## Worum es geht

Ein Bildschirmleser liest nur Bereiche von selbst vor, die dafür markiert sind (`aria-live`). Am Tisch ist das genau eine Stelle, der Ansager. Er sagt, was ein Gegner tut, wer dich angreift und wie die Abwehr ausgeht.

## Bestanden, wenn

Der Ansager (`data-testid="ansager"`, `aria-live="polite"`) enthält nacheinander die Sätze des Protokolls, etwa „KI-Gegner 1 spielt: Grün beginnt eine neue Schlange.“, „Abwehrfrage: Mit einem Farbenschutz wehrst du sie ab. …“ und „Du wehrst Schlangengrube mit Farbenschutz ab.“ Statuszeile und Protokoll stehen auf `aria-live="off"`; ausser dem Ansager liest kein Bereich denselben Satz vor.

## Fehlgeschlagen, wenn

Ein Gegnerzug, ein Angriff oder die Abwehr fehlt im Ansager, oder derselbe Satz steht in zwei vorlesenden Bereichen.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, Stand ab Commit 5634c28 |

## Testdaten

Szenarien `farbkarte-beim-gegner` und `angriff-auf-dich`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Adresse | öffnen | `/spiel?szenario=farbkarte-beim-gegner&tempo=sofort` | Ansager „Wähle eine Karte aus deiner Hand.“ |
| 2 | Konsole | Änderungen des Ansagers mitschreiben (`MutationObserver`) | | |
| 3 | Tisch | eine Karte spielen, „Zug beenden“ | | Ansager nennt deinen Zug, dann „KI-Gegner 1 spielt: …“ und „Du bist dran.“ |
| 4 | Adresse | öffnen | `/spiel?szenario=angriff-auf-dich&tempo=sofort` | Ansager „Abwehrfrage: Mit einem Farbenschutz wehrst du sie ab. …“ |
| 5 | Zugleiste | „Abwehren“ | | Ansager „Du wehrst Schlangengrube mit Farbenschutz ab. …“ |
| 6 | Seitenbaum | alle Bereiche mit `aria-live`, `role="status"`, `role="log"` lesen | | nur der Ansager liest vor |

## Zurücksetzen

Ein neues Szenario setzt den Stand zurück.

## Nicht abgedeckte Grenzfälle

Ob ein echter Bildschirmleser bei `tempo=sofort` jeden Satz ausspricht, ist nicht geprüft; mit der normalen Pause liegen die Sätze getrennt. Die erfüllte Aufgabe prüft `Ansager.test.tsx` (Szenario `aufgabe-lila-riese`), das Spielende TF-TISCH-045.
