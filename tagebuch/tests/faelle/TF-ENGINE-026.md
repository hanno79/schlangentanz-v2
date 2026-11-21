---
id: TF-ENGINE-026
titel: Nach jeder Kartenwirkung nennt das Ereignis KartenVersetzt jede bewegte Karte so, dass sich die sichtbare Lage aus den Ereignissen allein nachrechnen lässt.
art: automatisch
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
skript: src/engine/__tests__/kartenversetzt.test.ts
aenderung: task/E4b-versetzt (PR #63)
---

## Worum es geht

Die Oberfläche soll nach einer Sonderkarte zeigen können, welche Karten von wo nach wo gegangen sind, ohne zwei Zustände zu vergleichen (Plan E2, Kriterium 11). Seit E4b vergleicht die Engine dafür die Orte aller Karten vor und nach der Wirkung und meldet das Ergebnis als `KartenVersetzt`. Der Test spielt dazu Test-Karten über einen Spion auf dem Kartenregister und rechnet jeden Schritt mit `spieleNach` nach, das keine einzelne Karte kennt.

## Bestanden, wenn

Alle 11 Tests in `kartenversetzt.test.ts` bestehen: Karte aus fremder Schlange in eine neue eigene Schlange mit der Id `schlange-3`, Ablagestapel in der Reihenfolge Gelb, gespielte Karte, Blau, gefressene Fusion durch ihre linke und rechte Karte ersetzt, leer gefressene Schlange in `aufgeloest`, Fusion legt zwei Karten unter sich (Positionen 0 und 1), beim Umordnen nur die zwei Karten mit geänderter Reihenfolge, ohne Bewegung kein Ereignis, Karten auf Händen ohne Id und die Reihenfolge im Nachziehstapel nicht verraten. Ohne das Ereignis lässt sich die Lage nicht nachrechnen.

## Fehlgeschlagen, wenn

Ein Test rot ist, etwa weil `spieleNach` eine andere Lage ergibt als der neue Zustand oder ein Ereignis die Id einer Karte auf einer Hand nennt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf dem geprüften Stand von `task/E4b-versetzt`, `npm ci` gelaufen |

## Testdaten

Zwei Spieler mit Erweiterung, Spieler 1 hält die Test-Karte und Blau, Spieler 2 Blau, Rot, Gelb, Blau, Rot. Die Schlangen je Test stehen in der Testdatei.

## Technische Prüfung

`npx vitest run src/engine/__tests__/kartenversetzt.test.ts` endet mit Exit 0 und „Tests 11 passed (11)“.

## Nicht abgedeckte Grenzfälle

Eine Wirkung, die eine ganze Schlange einem anderen Spieler gibt, ist nicht abgedeckt: Keine Regel aus Teil A, B oder D tut das, und `spieleNach` behält dabei den alten Besitzer. Karten aus der Auslage (Comeback, Risiko) kennt der Vergleich nicht; eine Wirkung, die sie bewegt, bricht mit Fehler ab, und das kommt erst mit X1 und X2. Teilweise Abwehr, zwei Schlangen zweier Spieler gleichzeitig und das Geheimnis bei mehreren verdeckten Zielen haben eigene Testfälle (TF-ENGINE-027 bis TF-ENGINE-029).
