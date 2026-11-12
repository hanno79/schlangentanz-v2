#!/usr/bin/env python3
"""Erzeugt die Seiten Verlauf und Abbildungen aus den Phasen und Abbildungen.

Trennung von tagebuch_kapitel.py: dort stehen die Kapitel und der Überblick,
hier der Verlauf mit Filterleiste und die Abbildungsgalerie. Gefiltert,
sortiert und eingeklappt wird erst im Browser durch tagebuch.js; das HTML hier
zeigt alles ausgeklappt, damit die Seite auch ohne JavaScript vollständig
lesbar bleibt. Wird zusammen mit den übrigen tagebuch_*.py in Zielprojekte
kopiert und muss deshalb ohne Fremdabhängigkeit auskommen.
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import tagebuch_markdown
from tagebuch_modell import Phase
from tagebuch_quellen import (ARTEN, KAPITEL, PFLICHTABSCHNITTE, Abbildung,
                              Eintrag, abschnitte, ist_abschnittskopf,
                              vorspann, zeilen_mit_code)
from tagebuch_seiten import (abbildung_html, datum_anzeige, eintrag_anker,
                             html_text)

GEDANKENSTRICH = chr(0x2013)
# Der Titel eines Eintrags ist h3 (unter der h2 der Phase); sein Rumpf
# beginnt deshalb mit h4. Auch Abschnittstexte unter einer h4 ('Versuch')
# passen: ihr '###' wird so zu h5.
RUMPF_EBENE = 4


def _md(text: str) -> str:
    return tagebuch_markdown.nach_html(text, erste_ebene=RUMPF_EBENE)


def _anzahl_eintraege(anzahl: int) -> str:
    """Gleiche Wortwahl wie tagebuch.js nach dem Filtern."""
    return f"{anzahl} Eintrag" if anzahl == 1 else f"{anzahl} Einträge"


def _filterleiste(phasen: list[Phase]) -> str:
    """Schaltflächen je vorkommender Art, Auswahllisten, Sortierung, Suche.

    Art und Sortierung sind Umschalter mit aria-pressed. Der Sortierschalter
    behält deshalb seine Beschriftung; gedrückt heisst: älteste zuerst.
    """
    alle = [e for phase in phasen for e in phase.eintraege]
    knoepfe = [f'<button type="button" class="aktiv" data-art="alle" '
               f'aria-pressed="true">alle '
               f'<span class="anzahl">{len(alle)}</span></button>']
    for art in ARTEN:
        anzahl = sum(1 for e in alle if e.art == art)
        if anzahl:
            knoepfe.append(
                f'<button type="button" data-art="{html_text(art)}" '
                f'aria-pressed="false">'
                f'{html_text(art)} <span class="anzahl">{anzahl}</span></button>')
    kapitel = ['<option value="">alle Kapitel</option>'] + [
        f'<option value="{nummer}">{nummer} {html_text(titel)}</option>'
        for nummer, _datei, titel, _seite in KAPITEL]
    phasenwahl = ['<option value="">alle Phasen</option>'] + [
        f'<option value="{index}">{html_text(phase.titel)}</option>'
        for index, phase in enumerate(phasen)]
    return (
        '<div class="filterleiste">'
        f'<div class="arten">{"".join(knoepfe)}</div>'
        '<select data-filter="kapitel" aria-label="Kapitel">'
        f'{"".join(kapitel)}</select>'
        '<select data-filter="phase" aria-label="Phase">'
        f'{"".join(phasenwahl)}</select>'
        '<button type="button" data-sortierung="absteigend" '
        'aria-pressed="false">Älteste zuerst</button>'
        '<input type="search" data-suche placeholder="Suchen" '
        'aria-label="Einträge durchsuchen">'
        f'<span class="treffer" data-treffer>{_anzahl_eintraege(len(alle))}'
        '</span></div>')


def _uebrige_abschnitte(rumpf: str, namen: tuple[str, ...]) -> str:
    """Die '## '-Abschnitte ausser den genannten, ohne den Vorspann.

    Eine Überschrift in einem Codeblock beginnt keinen Abschnitt, wie in
    abschnitte(); sonst fiele der Rest eines Abschnitts weg, dessen Code ein
    '## Frage' zeigt.
    """
    behalten = []
    streichen = True
    for zeile, im_code in zeilen_mit_code(rumpf):
        if ist_abschnittskopf(zeile, im_code):
            streichen = zeile[3:].strip() in namen
        if not streichen:
            behalten.append(zeile)
    return "\n".join(behalten).strip()


def _entscheidung_html(eintrag: Eintrag) -> str:
    """Vorspann, dann die vier Pflichtfelder als Definitionsliste, dann der Rest.

    Der Vorspann leitet die Frage ein und steht deshalb davor. Die Liste
    heisst anders als der Artikel (`eintrag entscheidung`), damit eine Regel
    für den einen nicht den anderen trifft.
    """
    namen = PFLICHTABSCHNITTE["entscheidung"]
    einleitung = vorspann(eintrag.rumpf)
    felder = "".join(
        f'<dt>{html_text(name)}</dt>'
        f'<dd>{_md(eintrag.abschnitte[name])}</dd>'
        for name in namen)
    rest = _uebrige_abschnitte(eintrag.rumpf, namen)
    return ((_md(einleitung) if einleitung else "")
            + f'<dl class="entscheidungsfelder">{felder}</dl>'
            + (_md(rest) if rest else ""))


def _sackgasse_html(eintrag: Eintrag) -> str:
    """Abschnittsweise, damit 'Folge' als Ergebnis der Sackgasse auffällt."""
    einleitung = vorspann(eintrag.rumpf)
    stuecke = [_md(einleitung)] if einleitung else []
    for name, text in abschnitte(eintrag.rumpf).items():
        klasse = ("abschnitt folge" if name == PFLICHTABSCHNITTE["sackgasse"][-1]
                  else "abschnitt")
        stuecke.append(f'<section class="{klasse}"><h4>{html_text(name)}</h4>'
                       f'{_md(text)}</section>')
    return "".join(stuecke)


def _rumpf_html(eintrag: Eintrag) -> str:
    """v1-Einträge haben keine Pflichtabschnitte und bleiben unverändert."""
    if eintrag.v1:
        return _md(eintrag.rumpf)
    if eintrag.art == "entscheidung":
        return _entscheidung_html(eintrag)
    if eintrag.art == "sackgasse":
        return _sackgasse_html(eintrag)
    return _md(eintrag.rumpf)


def _vorschau(eintrag: Eintrag, abbildungen: dict[str, Abbildung],
              nummern: dict[str, str]) -> str:
    """Kleine Bilder (oder Nummern bei Tabellen) mit Link in die Galerie."""
    stuecke = []
    for name in eintrag.abbildungen:
        abbildung = abbildungen[name]
        if abbildung.art == "tabelle":
            inhalt = html_text(nummern[name])
        else:
            inhalt = (f'<img loading="lazy" src="abbildungen/'
                      f'{html_text(abbildung.datei)}" '
                      f'alt="{html_text(abbildung.titel)}">')
        stuecke.append(
            f'<a class="vorschau" href="abbildungen.html#abb-{html_text(name)}" '
            f'title="{html_text(nummern[name])} {html_text(abbildung.titel)}">'
            f'{inhalt}</a>')
    if not stuecke:
        return ""
    return '<div class="vorschauen">' + "".join(stuecke) + "</div>"


def _testlaeufe(testfaelle: list[str]) -> str:
    """Verweise auf die Testfälle, deren Läufe auf den Eintrag zeigen.

    Gezählt werden die Testfälle: Mehrere Läufe desselben Testfalls stehen
    in seiner Seite, hier genügt der Verweis darauf.
    """
    if not testfaelle:
        return ""
    anzahl = ("1 Testfall" if len(testfaelle) == 1
              else f"{len(testfaelle)} Testfällen")
    verweise = ", ".join(f'<a href="tests/{html_text(k)}.html">{html_text(k)}</a>'
                         for k in testfaelle)
    return f'<p class="testlaeufe">Testläufe zu {anzahl}: {verweise}</p>'


def _eintrag_html(eintrag: Eintrag, abbildungen: dict[str, Abbildung],
                  nummern: dict[str, str], testfaelle: list[str]) -> str:
    betrifft = (f'<span class="betrifft">{html_text(eintrag.betrifft)}</span>'
                if eintrag.betrifft else "")
    chips = "".join(
        f'<span class="chip"><b>{html_text(k.wert)}</b> '
        f'{html_text(k.bezeichnung)}</span>' for k in eintrag.kennzahlen)
    chips = f'<div class="chips">{chips}</div>' if chips else ""
    kapitel = " ".join(str(n) for n in eintrag.kapitel)
    return (
        f'<article id="{eintrag_anker(eintrag.datei)}" '
        f'class="eintrag {html_text(eintrag.art)}" '
        f'data-art="{html_text(eintrag.art)}" data-kapitel="{kapitel}" '
        f'data-datum="{html_text(eintrag.datum)}">'
        f'<header class="eintragskopf">'
        f'<span class="art">{html_text(eintrag.art)}</span>'
        f'<time datetime="{html_text(eintrag.datum)}">'
        f'{datum_anzeige(eintrag.datum)}</time>'
        f'<span class="wer">{html_text(eintrag.wer)}</span>{betrifft}'
        f'<h3>{html_text(eintrag.titel)}</h3></header>'
        f'{chips}'
        f'<div class="eintragstext">{_rumpf_html(eintrag)}</div>'
        f'{_testlaeufe(testfaelle)}'
        f'{_vorschau(eintrag, abbildungen, nummern)}</article>')


def _phase_html(index: int, phase: Phase, abbildungen: dict[str, Abbildung],
                nummern: dict[str, str],
                laeufe_je_eintrag: dict[str, list[str]]) -> str:
    zeitraum = datum_anzeige(phase.von)
    if phase.bis != phase.von:
        zeitraum += f" {GEDANKENSTRICH} " + datum_anzeige(phase.bis)
    eintraege = "".join(_eintrag_html(e, abbildungen, nummern,
                                      laeufe_je_eintrag.get(e.datei, []))
                        for e in phase.eintraege)
    return (
        f'<section class="phase" data-phase="{index}">'
        f'<h2>{html_text(phase.titel)} <span class="zeitraum">{zeitraum}</span> '
        f'<span class="anzahl" data-phase-anzahl>{len(phase.eintraege)}</span>'
        f'</h2>{eintraege}</section>')


def verlauf(phasen: list[Phase], abbildungen: dict[str, Abbildung],
            nummern: dict[str, str],
            laeufe_je_eintrag: dict[str, list[str]] | None = None) -> str:
    """Inhalt der Seite verlauf.html: Filterleiste, dann die Phasen.

    Die Seitenüberschrift setzt tagebuch_bauen.py, wie bei allen Seiten.
    Ohne Einträge steht statt Filterleiste und Phasen ein sichtbarer
    Hinweis, wie bei leeren Kapiteln. `laeufe_je_eintrag` (Eintragsdatei ->
    Testfall-IDs) kommt aus dem Testregister; ein Eintrag mit Läufen
    verweist auf deren Testfälle, die Läufe selbst erscheinen hier nicht.
    """
    if not any(phase.eintraege for phase in phasen):
        return '<p class="leer">Noch keine Einträge.</p>'
    teile = [_phase_html(i, p, abbildungen, nummern, laeufe_je_eintrag or {})
             for i, p in enumerate(phasen)]
    return (_filterleiste(phasen)
            + '<div class="verlauf" data-verlauf>' + "".join(teile) + "</div>")


def _nummernschluessel(nummer: str) -> tuple[str, int]:
    kuerzel, zahl = nummer.rsplit(" ", 1)
    return kuerzel, int(zahl)


def abbildungsgalerie(abbildungen: list[Abbildung],
                      nummern: dict[str, str]) -> str:
    """Inhalt der Seite abbildungen.html: alle Abbildungen nach Nummer."""
    if not abbildungen:
        return '<p class="leer">Noch keine Abbildungen.</p>'
    geordnet = sorted(abbildungen,
                      key=lambda a: _nummernschluessel(nummern[a.name]))
    figuren = "".join(abbildung_html(a, nummern[a.name]) for a in geordnet)
    return f'<div class="galerie" data-lightbox>{figuren}</div>'
