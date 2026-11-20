---
id: TF-DEV-019
titel: Im Szenario „verdoppler“ zeigt der Entwicklertisch den zweiten Zug mit „Teilzug 2“, bietet dort keinen Verdoppler mit Wirkung an und nennt beim Versuch den Grund.
art: manuell
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-20
veraendert_daten: nein
aenderung: task/E3-verdoppler (PR #51)
---

## Worum es geht

Am Entwicklertisch lässt sich der Verdoppler Schritt für Schritt durchspielen. Man sieht, ob der Spieler nach dem ersten Zug auffüllt, ob derselbe Spieler sofort einen zweiten Zug bekommt und ob ein zweiter Verdoppler dort nur noch wirkungslos abgelegt werden kann.

## Bestanden, wenn

Zu Beginn stehen zwei Knöpfe „VerdopplerSpielen“, kein wirkungsloses Ablegen eines Verdopplers. Nach „VerdopplerSpielen: Verdoppler (verdoppler-03)“ meldet die Seite KarteGespielt auf den Ablagestapel von Spieler 1, „Entscheidet: Spieler 1“, „Schwebend: keine Karte“ und nur noch FarbkarteLegen und ZugBeenden. Nach Rot und „ZugBeenden“ stehen KartenGezogen (Spieler 1 zieht 2) und „ZugBegonnen: Spieler 1, Teilzug 2“ da, Hände 5/5/5, Stapel 91, kein VerdopplerSpielen, der zweite Verdoppler nur unter SonderkarteWirkungslosAblegen. Ein VerdopplerSpielen mit verdoppler-02 zeigt „Abgelehnt: … gibt ein weiterer Verdoppler keinen weiteren Zug (A7.8, D11); er lässt sich nur wirkungslos auf den eigenen Ablagestapel legen (D23)“, der Schritt bleibt gleich. Nach Blau, dem wirkungslosen Verdoppler und „ZugBeenden“ beginnt KI-Gegner 1 mit Teilzug 1, Hände 5/5/5, Stapel 89. Keine Konsolenfehler, kein waagrechtes Scrollen.

## Fehlgeschlagen, wenn

Ein KI-Gegner gefragt wird, der zweite Zug ohne Auffüllen beginnt, im zweiten Zug ein VerdopplerSpielen angeboten oder ausgeführt wird, die Ablehnung keinen Grund nennt oder die Seite breiter als das Fenster ist.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, `npm run build:testhooks` und `npm run preview:testhooks` auf Port 4174 |
| Ausgangslage prüfen | Desktop 1280×900 mit Maus, Handy hochkant 390×844 mit Touch |

## Testdaten

Szenario `verdoppler`: drei Spieler, Spieler 1 hält Verdoppler, Rot, Blau, Schlangenfrass, Verdoppler; beide KI-Gegner halten einen Farbenschutz. Der abgelehnte Verdoppler: `{"typ":"VerdopplerSpielen","spielerId":"spieler-1","karteId":"verdoppler-02"}`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | `/dev?szenario=verdoppler` | Seite öffnen | | „Aktionen der Engine (5)“, zweimal VerdopplerSpielen |
| 2 | Aktionen der Engine | „VerdopplerSpielen: Verdoppler (verdoppler-03)“ klicken bzw. tippen | | KarteGespielt → Ablagestapel von Spieler 1; Entscheidet Spieler 1; nur FarbkarteLegen (2) und ZugBeenden |
| 3 | Aktionen der Engine | „FarbkarteLegen: Feuerkeim (rot-05) → neue Schlange“, dann „ZugBeenden“ | | KartenGezogen: Spieler 1 zieht 2; ZugBegonnen: Spieler 1, Teilzug 2; Hände 5/5/5; Stapel 91 |
| 4 | Entwicklerwerkzeuge des Browsers | die Funktion `fuehreAus` der Bedienung mit der Aktion aus „Testdaten“ aufrufen (der Tisch bietet den Knopf nicht an) | Aktion aus „Testdaten“ | roter Kasten „Abgelehnt: …(A7.8, D11)…(D23)“; Schritt bleibt 3 |
| 5 | Aktionen der Engine | „FarbkarteLegen: Wasserwirbel (blau-01) → neue Schlange“, dann „SonderkarteWirkungslosAblegen: Verdoppler (verdoppler-02)“ | | nur noch ZugBeenden; Ereignis verdoppler-02 → Ablagestapel von Spieler 1 |
| 6 | Aktionen der Engine | „ZugBeenden“ | | KartenGezogen: Spieler 1 zieht 2; ZugBegonnen: KI-Gegner 1, Teilzug 1; Stapel 89 |

## Nicht abgedeckte Grenzfälle

Die übrigen Geräteklassen nicht, weil der Entwicklertisch nur ein Prüfwerkzeug ist; seine Breite in allen fünf Klassen prüfen die Layout-Verträge für andere Szenarien.
