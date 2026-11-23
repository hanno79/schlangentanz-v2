---
id: TF-ENGINE-062
titel: Mischt man verdeckte Karten neu, bleiben die KI-Sicht eines Gegners und die Ereignisse einer Entscheidungskette gleich; nur die offen aufgedeckte Karte darf sich ändern.
art: manuell
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-23
veraendert_daten: nein
aenderung: task/X3-zusatzaktionen (PR #108)
---

## Worum es geht

Zusatzaktionen können für verdeckt gezogene Karten gelten (D43), und Entscheidungen bewegen Karten zwischen Stapel und Händen. Weder Sicht noch Ereignisse dürfen dabei verraten, welche verdeckte Karte wo liegt (B2). Die Störprobe mischt alles Verdeckte neu und vergleicht.

## Bestanden, wenn

Für 25 Mischungen je Gegner (zwei Gegner) ist die Sicht als JSON gleich, und für 60 Mischungen je Wahl („stapel“, „aufgedeckte“) sind die Ereignisse aller drei Schritte gleich, wenn man die Id der aufgedeckten Karte durch einen Platzhalter ersetzt. Mindestens sechs Abläufe werden verglichen.

## Fehlgeschlagen, wenn

Eine Sicht oder ein Ereignis unterscheidet sich, also hängt sie von einer verdeckten Karte ab.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo auf 686159e |

## Testdaten

Drei Spieler; Spieler 1 hat eine Zugerweiterung „Schlangenkorb“ mit zwei Zusatzaktionen nur für seine ersten drei Handkarten. Für die Kette: Test-Karte und Test-Entscheidungen aus `rahmen_hilfen.ts`, Gegnerwahl spieler-3.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Repo | Störprobe aus dem Beleg als `src/engine/__tests__/x3_pruefer_stoerprobe.test.ts` ablegen |  | Datei liegt neben den anderen Engine-Tests |
| 2 | Konsole | ausführen | `npx vitest run src/engine/__tests__/x3_pruefer_stoerprobe.test.ts --reporter=verbose` | zwei Tests grün, Ausgabe „Störprobe Ereignisse: 120 gemischte Abläufe verglichen“ |
| 3 | `src/ki/sicht.ts` | Gegenprobe: `zug: zugInSicht(zustand, spielerIndex)` durch `zug: zustand.zug` ersetzen und Schritt 2 wiederholen |  | der Sicht-Test ist rot |
| 4 | Repo | `src/ki/sicht.ts` zurückholen, Störprobe löschen | `git checkout -- src/ki/sicht.ts` | `git status` ist leer |

## Technische Prüfung

Vitest-Datei mit `mischeVerborgenes` aus `src/ki/__tests__/verborgenes.ts`; die Zusatzaktionen werden nach dem Mischen auf dieselben Handplätze umgeschrieben, damit der gemischte Stand möglich bleibt. Gegenprobe: `zug: zustand.zug` statt `zugInSicht` in `src/ki/sicht.ts` macht den Sicht-Vergleich rot.

## Nicht abgedeckte Grenzfälle

`OffeneEntscheidung.daten` und `optionen` bleiben in X3 leer beziehungsweise offen; ob X5 dort keine verdeckten Ids ablegt, ist dort zu prüfen.
