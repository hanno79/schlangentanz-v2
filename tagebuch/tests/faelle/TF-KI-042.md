---
id: TF-KI-042
titel: Auch in einer späten Stellung mit über 9'000 Korb-Tauschen erfüllt die solide KI eine erreichbare Aufgabe, wenn kein anderer Zug höher bewertet ist.
art: automatisch
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-27
veraendert_daten: nein
skript: src/ki/strategien/solideKi_erweiterung_partien.test.ts
aenderung: task/K4-ki-erweiterung (PR #125)
grenzfall_von: TF-KI-039
---

## Worum es geht

Der Schlangenkorb mit „tauschen“ bietet spät in der Partie Tausende Aktionen an. Die Zugsuche rechnet je Schritt nur eine begrenzte Zahl durch (K2.8). Geprüft wird, ob die KI dabei eine Aufgabe übersieht, die ein Tausch sofort erfüllen würde, obwohl ihr eigener Zug nicht besser bewertet ist.

## Bestanden, wenn

In der Stellung aus Saat 77'103 (zwei Spieler, solide KI an Sitz 0, ihr 33. Zug) erfüllt die KI Farbvielfalt, oder ihr Zug ist bis vor „Zug beenden“ strikt höher bewertet als der beste erfüllende Zug samt zweiter Karte (Bewertung wie in `solideKi_erweiterung_partien.test.ts`).

## Fehlgeschlagen, wenn

Sie erfüllt Farbvielfalt nicht, und ihr Zug ist niedriger bewertet als der beste erfüllende.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf dem geprüften Stand von `task/K4-ki-erweiterung`, `npm ci` gelaufen |

## Testdaten

Saat 77'103, 2 Spieler, mit Erweiterung; Sitz 0 solide KI mit `erzeugeZufall(77'103 × 7)`, Sitz 1 Zufalls-KI mit `erzeugeZufall(77'103 × 11 + 1)`; Zug 33 von Sitz 0. Hand: Blau, Rot, Blau, Rot, Schlangenkorb des Glücks; 9'557 angebotene Aktionen; freie Aufgaben Schlangentanz, Gelber Schatz, Farbvielfalt.

## Technische Prüfung

Die Probe `zz_pruefer_k4_detail.test.ts` aus dem Beleg nach `src/ki/strategien/` legen, mit `K4_DETAIL_SAAT=77103 K4_DETAIL_SPIELER=2 K4_DETAIL_ZUG=33` ausführen und danach löschen; die Werte „Bewertung“ stehen in der Ausgabedatei. Den Vergleich über alle erfüllenden Aktionen liefert die Probe `zz_pruefer_k4.test.ts` (Feld `k41.verfehlt`).
