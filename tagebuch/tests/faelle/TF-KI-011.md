---
id: TF-KI-011
titel: Auch wenn der KI-Zufall zufällig dieselbe Saat hat wie die Partie, hängt die Wahl der soliden KI nicht davon ab.
art: automatisch
regression: ja
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
skript: src/ki/strategien/zugsuche.test.ts
aenderung: task/K2-solide-ki (PR #71)
grenzfall_von: TF-KI-008
---

## Worum es geht

Am Entwicklertisch bekommt die KI den Zufall `erzeugeZufall(schritt)`, die Partie entsteht aus `erzeugeZufall(saat)`. Ist die Schrittnummer gleich der Saat, mischt der Rahmen beim Erraten genau wie die Partie und trifft damit die echten Hände und den echten Stapel. Geprüft wird, ob das die Wahl der soliden KI beeinflusst.

## Bestanden, wenn

In mindestens 200 Stellungen wählt die solide KI mit zwei verschiedenen KI-Saaten dasselbe, die Wahl hängt also nicht vom erratenen Verdeckten ab.

## Fehlgeschlagen, wenn

In einer Stellung die Wahl mit einer anderen KI-Saat anders ausfällt; dann wirkt sich ein Gleichstand von KI-Saat und Partiesaat auf die Entscheidung aus.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf dem geprüften Stand von `task/K2-solide-ki`, `npm ci` gelaufen |

## Testdaten

232 Stellungen wie bei TF-KI-008, KI-Saaten i und i + 100'000. Für die Trefferquote 30 Partien mit Saat 1 bis 30, erraten mit KI-Saat gleich Partiesaat und mit KI-Saat + 50'000.

## Technische Prüfung

Probe `pruefer_k2.test.ts` aus dem Beleg, Tests „Kriterium 7 eigene Probe“ und „KI-Zufall gleich Partiesaat“; die Werte stehen in der Logdatei.
