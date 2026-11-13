---
id: TF-SPEC-010
titel: Ist die Website nicht erreichbar, bricht npm run abgleich:website rasch mit Exit 1 und einer Fehlermeldung ab.
art: manuell
regression: nein
prioritaet: niedrig
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
aenderung: task/P0.5c-website-abgleich (PR #38)
grenzfall_von: TF-SPEC-005
---

## Worum es geht

Ist die Website nicht erreichbar, soll der Abgleich rasch und verständlich abbrechen, statt zu hängen oder still eine falsche Abdeckung zu melden.

## Bestanden, wenn

`npm run abgleich:website` mit `HTTPS_PROXY=http://127.0.0.1:9` endet in weniger als 30 Sekunden mit Exit 1 und einer Meldung, die mit „FEHLER beim Abgleich:“ beginnt.

## Fehlgeschlagen, wenn

Der Befehl hängt, endet mit Exit 0 oder nennt keinen Grund.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Arbeitskopie auf dem zu prüfenden Commit, auf Port 9 lauscht nichts |

## Testdaten

Proxy `http://127.0.0.1:9` (dort lauscht nichts), Adresse `https://schlangentanz.ch/rules`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Git Bash im Repo | Abgleich mit totem Proxy starten und die Zeit messen | `time (HTTPS_PROXY=http://127.0.0.1:9 npm run abgleich:website; echo $?)` | „FEHLER beim Abgleich: page.goto: net::ERR_PROXY_CONNECTION_FAILED …“, Exit 1, wenige Sekunden |
