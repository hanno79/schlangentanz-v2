---
id: TF-KI-019
titel: Die solide KI wehrt in Partien jeden Angriff auf eine eigene Gruppe und jeden Schaden in der Schlussrunde ab, und ihre Abwehr hängt nicht von verdeckten Karten ab.
art: automatisch
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-23
veraendert_daten: nein
skript: src/ki/strategien/abwehr.test.ts
aenderung: task/K3-angriff-abwehr (PR #101)
---

## Worum es geht

Kriterium 4 und 6 von K3 auf eigenen Saaten: Gesammelt wird jede Stellung, in der ein Spieler mit Farbenschutz gefragt ist. Die Probe teilt sie nach dem echten Schaden ein und schaut, wie die solide KI entscheidet. Danach mischt sie fremde Hände, Stapel und geheime Aufgaben neu; die Entscheidung muss gleich bleiben.

## Bestanden, wenn

Jede Stellung, in der Durchlassen eine eigene Gruppe kostet oder die Gruppen mindestens 3 Punkte, endet mit „abwehren“. Jede Stellung in der Schlussrunde mit Punktverlust oder verlorenem letztem Zug endet mit „abwehren“. Eine Grube auf einen Spieler ohne Zug (D29) endet nie mit „abwehren“. In allen Störproben weicht keine Entscheidung ab.

## Fehlgeschlagen, wenn

Eine der Zählungen oben eine Ausnahme zeigt oder eine Störprobe eine andere Entscheidung liefert.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf dem geprüften Stand von `task/K3-angriff-abwehr`, `npm ci` gelaufen |

## Testdaten

40 Partien nur mit der soliden KI, Saat 61'000 bis 61'039, sonst wie in TF-KI-018. Je Stellung zwei KI-Saaten und drei Mischungen, also sechs Störproben.

## Technische Prüfung

Probe aus dem Beleg unter `tests/` ablegen, `npx vitest run tests/zz_pruefer_k3.test.ts -t "Abwehr in Partien"`. Die Zeilen „ABWEHR n=…“, „STOERPROBE …“ und „AUFFAELLIG“ stehen danach in der Ausgabedatei.

## Nicht abgedeckte Grenzfälle

Grenzfälle mit gebauten Stellungen stehen in TF-KI-020. Wie viele harmlose Angriffe die KI durchlässt, zählt die Probe, bewertet es aber nicht; „harmlos“ ist ein Urteil über den Wert des Farbenschutzes.
