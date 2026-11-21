---
id: TF-DEV-028
titel: Die Szenarien fusion-eigen und fusion-beim-gegner laufen am Entwicklertisch mit Klicks so ab, wie ihre Beschreibung erwartet, auf dem Desktop und auf dem Handy hochkant.
art: manuell
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/E7-farbenfusion (PR #65)
---

## Worum es geht

Die beiden Szenarien von E7 zeigen die Farbenfusion am Entwicklertisch, einmal in der eigenen Schlange und einmal beim Gegner mit Abwehr. Ein Tester klickt sie durch und vergleicht Knöpfe, Ereignisse, Schlangen und Wertung mit dem Text „Erwartet“ des Szenarios.

## Bestanden, wenn

- `fusion-eigen`: vier Knöpfe „FusionLegen“, kein „SonderkarteWirkungslosAblegen“. Nach dem zweiten Knopf (Tooltip `kartenIds` gelb-05, gelb-13): KartenVersetzt mit gelb-05 „Stelle 2 → unter farbenfusion-02 … Stelle 0“ und gelb-13 „Stelle 3 → … Stelle 1“, dann KarteGespielt „→ schlange-1 von Spieler 1, Stelle 2“. Schlange: Blau, Blau, Farbenfusion, darunter „Unter farbenfusion-02“ mit den beiden Gelb. Nur noch FarbkarteLegen und ZugBeenden. Wertung Spieler 1: Gruppen 4 im Zwischenstand und in der Endwertung, Aufschlüsselung „Blau×3 = 4; Joker: Farbenfusion (farbenfusion-02) als Blau“.
- `fusion-beim-gegner`: drei Knöpfe. Erster Knopf (rot-02, rot-15): KarteAngesagt „trifft KI-Gegner 1“, AbwehrGefragt, zwei Knöpfe „Reagieren: abwehren mit Farbenschutz (farbenschutz-02)“ und „Reagieren: durchlassen“. Abwehren: Abgewehrt, AnsageEntschieden „ohne Wirkung … → Ablagestapel von Spieler 1“, Schlange Rot, Rot, Rot, KI-Gegner 1 mit Gruppen 3. Durchlassen stattdessen: KartenVersetzt (rot-02 Stelle 0, rot-15 Stelle 1 unter farbenfusion-04), AnsageEntschieden „wirkt … Stelle 0“, Schlange Farbenfusion, Rot, KI-Gegner 1 mit Gruppen 0 und Kette 0. Dritter Knopf: nur KI-Gegner 2 gefragt, nur „Reagieren: durchlassen“, danach Farbenfusion, Blau.
- In beiden Geräteklassen alle Invarianten erfüllt, kein Konsolenfehler, `scrollWidth` gleich `clientWidth`.

## Fehlgeschlagen, wenn

Ein Knopf fehlt oder zu viel da ist, ein Ereignis fehlt oder eine andere Stelle nennt, eine Karte auf dem falschen Stapel liegt, die Wertung nicht zur Schlange passt, eine Invariante verletzt ist oder die Seite waagrecht scrollt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build (`npm run build:testhooks`) von `e48c49e`, `vite preview --outDir dist-testhooks` auf Port 4191 |

## Testdaten

Adressen `/dev?szenario=fusion-eigen` und `/dev?szenario=fusion-beim-gegner`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser, `/dev?szenario=fusion-eigen` | Tooltips der FusionLegen-Knöpfe lesen, den zweiten klicken | | Werte wie unter „Bestanden, wenn“ |
| 2 | dieselbe Seite | zu „Spieler“ und „Wertung“ scrollen | | Unter farbenfusion-02 die beiden Gelb, Gruppen 4 |
| 3 | Browser, `/dev?szenario=fusion-beim-gegner` | ersten FusionLegen-Knopf, dann „Reagieren: abwehren mit Farbenschutz“ | | Abgewehrt, Ablagestapel, Gruppen 3 |
| 4 | dieselbe Seite | „Schritt zurück“, dann „Reagieren: durchlassen“ | | KartenVersetzt, Schlange Farbenfusion, Rot, Gruppen 0 |
| 5 | dieselbe Seite | „Von vorn“, dritten FusionLegen-Knopf, dann „KI-Schritt“ | | nur durchlassen, danach Farbenfusion, Blau |
| 6 | dieselbe Seite | „ZugBeenden“, dann sechsmal „KI-Schritt“ | | Partie läuft weiter, alle Invarianten erfüllt |
| 7 | Playwright, Desktop 1280×900 und Handy hochkant 390×844 mit Touch | Schritte 1, 3 und 4 mit `click()` beziehungsweise `tap()` | | dieselben Werte, `scrollWidth` gleich Fensterbreite |

## Nicht abgedeckte Grenzfälle

Tablet quer, Tablet hochkant und Handy quer sind nicht durchgespielt, weil E7 die Oberfläche des Entwicklertischs nicht verändert; das deckt `npm run test:layout` ab.
