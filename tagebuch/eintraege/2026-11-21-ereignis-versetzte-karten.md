---
datum: 2026-11-21
zeit: 13:11
titel: Kartenwirkungen meldet die Engine zentral über einen Ortsvergleich, nicht jede Karte für sich
art: entscheidung
wer: Claude Code
betrifft: E4b
kapitel: 3, 5
---

Die Frage kam auf, als die Kartentasks E6 und E8 an denselben Tests anhielten und E7 kurz darauf auch.

## Frage

Wie erfährt die Oberfläche, welche Karten eine Sonderkarte bewegt hat, ohne dafür zwei Spielzustände zu vergleichen?

## Optionen

Jede Karte hätte ein eigenes Ereignis melden können, etwa „Karte gefressen“ oder „Karte gestohlen“. Das hätte vier neue Ereignistypen bedeutet, eine Änderung der Kartenschnittstelle und vier Fassungen des Nachrechentests in derselben Datei. Die andere Möglichkeit war, dass die Engine selbst nach jeder Wirkung die Orte aller Karten vorher und nachher vergleicht und ein einziges allgemeines Ereignis meldet.

## Gewählt

Die Engine meldet nach jeder Kartenwirkung ein allgemeines Ereignis mit jeder bewegten Karte, ihrem alten und neuen Ort, neu entstandenen und verschwundenen Schlangen. Karten, die verdeckt auf eine Hand oder in den Nachziehstapel gehen, stehen darin ohne Id.

## Begründung

Der Vergleich steht an einer Stelle und gilt für jede Karte, auch für die, die noch kommen. Die Kartendateien bleiben frei von Ereignislogik, und die parallelen Kartentasks mussten die gemeinsamen Testdateien nicht anfassen. Codex hat in 5'000 erzeugten Fällen keine Abweichung beim Nachrechnen gefunden und ein Leck über die Reihenfolge im Nachziehstapel aufgedeckt, das vor dem Merge behoben wurde.
