---
id: TF-DEV-016
titel: Das Szenario wertung-vielfalt-regenbogen zeigt am Entwicklertisch die von Hand nachgerechnete Wertung 16 zu 22 und das Etikett „Farben für den Vielfaltbonus“.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-20
veraendert_daten: nein
aenderung: task/E10b-vielfalt-regenbogen (PR #52)
---

## Worum es geht

Am Entwicklertisch soll man D32 sehen und nachrechnen können: Spieler 1 hat neben drei Farbgruppen eine Gruppe aus drei Regenbogenschlangen, die keine Farbe für den Vielfaltbonus bringt. Das Etikett heisst jetzt „Farben für den Vielfaltbonus“, weil „Farben mit Gruppe“ bei einer solchen Gruppe nicht mehr stimmt.

## Bestanden, wenn

Im Abschnitt „Wertung“ steht in der Endwertung Spieler 1 mit Gruppen 9, Vielfalt 2, Kette 5, Aufgaben 0, Summe 16 und KI-Gegner 1 mit 14, 3, 5, 0, 22, darunter „Gewonnen: KI-Gegner 1 (22)“. Die Aufschlüsselung nennt für Spieler 1 „Blau×3 = 0“, alle drei Regenbogenschlangen „als Blau“ und „Farben für den Vielfaltbonus: Blau, Rot, Gelb, Vielfalt 2“, für KI-Gegner 1 die Regenbogenschlange „als Rot“ und „Farben für den Vielfaltbonus: Blau, Rot, Gelb, Violett, Vielfalt 3“. Der Text „Farben mit Gruppe“ kommt nicht vor. Bei 1280 und bei 390 px Breite ist `scrollWidth` gleich `clientWidth`, keine Konsolenfehler.

## Fehlgeschlagen, wenn

Eine Zahl abweicht, die Regenbogen-Gruppe als Farbe zählt, das alte Etikett erscheint oder die Seite waagrecht scrollt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build (`npm run build:testhooks`), Vorschau mit `vite preview --outDir dist-testhooks`, Fenster 1280×900 und 390×844 |

## Testdaten

Szenario `wertung-vielfalt-regenbogen` aus `/dev/szenarien`. Nachrechnung: Spieler 1 Rot³ 3 + Blau³ 3 + Gelb³ 3 + Regenbogen³ 0 = 9, drei Farben gibt 2, Kette 3 gibt 5, Summe 16. KI-Gegner 1 Blau³ 3 + Rot, Regenbogenschlange, Rot 2 + Gelb³ 3 + Violett³ 6 = 14, vier Farben gibt 3, Kette 5, Summe 22.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | `/dev/szenarien` | Link `wertung-vielfalt-regenbogen` anklicken | | Tisch lädt, „Invarianten (alle erfüllt)“ |
| 2 | Abschnitt „Wertung“ | Tabellen und Aufschlüsselung lesen | | Werte wie unter „Bestanden, wenn“ |
| 3 | Browser | Fenster auf 390×844 stellen, Seite neu laden | | gleiche Werte, nichts abgeschnitten, kein waagrechtes Scrollen |

## Nicht abgedeckte Grenzfälle

Tablet und Handy quer misst der Layout-Vertrag `entwicklertisch_breite` mit. Eine Gruppe aus Regenbogenschlangen und Farbenfusion zeigt das Szenario nicht, weil die Regel dazu offen ist.
