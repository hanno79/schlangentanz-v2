#!/usr/bin/env python3
"""HTML der Seiten des Testregisters: Tests, Testfall und Durchgänge.

Liefert nur den Inhalt, das Gerüst mit Kopf und Gliederung setzt
tagebuch_seiten.seite. Der Inhalt liest das Register (testregister_laeufe)
und die Ableitungen aus testregister_modell; er rechnet nichts selbst aus,
was dort schon steht. Aussehen nur über Klassen, die Gestaltung liegt in
stil.css. Wird zusammen mit den übrigen tagebuch_*.py in Zielprojekte kopiert
und kommt ohne Fremdabhängigkeit aus.

regelcheck: laenge-bewusst die drei Seiten teilen Statusmarke, Urteil,
Commit und Verweise; getrennt müsste jede Datei sie von einer anderen holen.
"""

from __future__ import annotations

import sys
from pathlib import Path
from urllib.parse import quote

sys.path.insert(0, str(Path(__file__).resolve().parent))

from tagebuch_markdown import nach_html
from tagebuch_seiten import datum_anzeige, eintrag_verweis, html_text
from testregister_laeufe import Durchgang, Lauf, Register, lauf_reihenfolge
from testregister_modell import (
    OHNE_TESTFALL, Freigabe, bereich_farbe, durchgang_stand, grenzfaelle,
    letzter_lauf, luecken,
)
from testregister_quellen import (HERKUNFT_ANZEIGE, STATUS, Testfall,
                                  status_anzeige)


def _klasse(auswertung: Freigabe) -> str:
    return "freigegeben" if auswertung.freigegeben else "gesperrt"


def _stand(auswertung: Freigabe, stand: str) -> str:
    """Urteil mit dem Commit, auf dem es fiel (durchgang_stand). Die Seite urteilt
    nie über HEAD; „freigegeben“ allein läse sich wie eine Freigabe für HEAD."""
    return f"freigegeben auf {stand[:7]}" if auswertung.freigegeben else "gesperrt"


def _zaehler(auswertung: Freigabe) -> str:
    return f"{auswertung.bestanden} von {auswertung.faellig} bestanden"


def _testfall_verweis(kennung: str, ordner: str = "tests/") -> str:
    """Verweis auf die Testfallseite; ordner="" von einer Seite unter tests/ aus."""
    ziel = f"{ordner}{html_text(kennung)}.html"
    return f'<a href="{ziel}">{html_text(kennung)}</a>'


BILD_ENDUNGEN = (".png", ".jpg", ".jpeg", ".webp", ".svg")


def _beleg_html(name: str) -> str:
    """Beleg unter belege/, Bilder als Vorschau.

    Task 9 kopiert die Belege nach website/tests/belege/, also neben die
    Testfallseiten unter tests/. Der Dateiname steht URL-kodiert im Verweis.
    """
    ziel = f"belege/{html_text(quote(name))}"
    if name.lower().endswith(BILD_ENDUNGEN):
        return (f'<a href="{ziel}"><img class="beleg-vorschau" src="{ziel}" '
                f'alt="Beleg {html_text(name)}" loading="lazy"></a>')
    return f'<a href="{ziel}">{html_text(name)}</a>'


def _status_marke(status: str) -> str:
    """Klasse aus dem Quellwert (für stil.css), Text mit echten Umlauten."""
    return (f'<span class="status status-{html_text(status)}">'
            f'{html_text(status_anzeige(status))}</span>')


def _commit(kennung: str) -> str:
    """Die ersten sieben Zeichen, die volle ID im title zum Nachschlagen."""
    return (f'<span class="commit" title="{html_text(kennung)}">'
            f'{html_text(kennung[:7])}</span>')


def _neuester_durchgang(register: Register) -> Durchgang | None:
    return max(register.durchgaenge, key=lambda d: d.id, default=None)


def _text(markdown: str, erste_ebene: int = 3) -> str:
    return nach_html(markdown, erste_ebene=erste_ebene) if markdown else ""


def ueberblick_kachel(durchgang: Durchgang | None,
                      auswertung: Freigabe | None, stand: str) -> str:
    """Kachel der Überblicksseite mit dem letzten Durchgang, verlinkt auf durchgaenge.html.

    `stand` ist der Commit, auf dem der Durchgang beurteilt wurde.
    """
    if durchgang is None:
        return '<div class="kachel"><span class="bezeichnung">Noch kein Durchgang</span></div>'
    text = (f"Letzter Durchgang {durchgang.id} "
            f"({durchgang.anlass} {datum_anzeige(durchgang.datum)})")
    if auswertung is not None:
        text += f": {_zaehler(auswertung)}, {_stand(auswertung, stand)}"
    klasse = f" status-{_klasse(auswertung)}" if auswertung is not None else ""
    return (f'<a class="kachel{klasse}" href="durchgaenge.html">'
            f'<span class="bezeichnung">{html_text(text)}</span></a>')


def laeufe_je_eintrag(register: Register) -> dict[str, list[str]]:
    """Eintragsdatei -> Testfall-IDs ihrer Läufe, sortiert und ohne Doppelte."""
    ergebnis: dict[str, set[str]] = {}
    for lauf in register.laeufe:
        if lauf.eintrag:
            ergebnis.setdefault(lauf.eintrag, set()).add(lauf.testfall)
    return {eintrag: sorted(ids) for eintrag, ids in ergebnis.items()}


def _kacheln(register: Register, auswertung: Freigabe | None) -> str:
    durchgang = _neuester_durchgang(register)
    if durchgang is None:
        erste = ueberblick_kachel(None, None, "")
        zaehler = ""
    else:
        if auswertung is not None:
            klasse = _klasse(auswertung)
            stand = _stand(auswertung, durchgang_stand(register, durchgang))
        else:
            klasse, stand = "nicht-ausgewertet", "nicht ausgewertet"
        erste = (f'<a class="kachel status-{klasse}" '
                 f'href="durchgaenge.html"><b class="wert">{html_text(stand)}</b>'
                 f'<span class="bezeichnung">{html_text(durchgang.id)}, '
                 f'{html_text(durchgang.anlass)}</span></a>')
        zaehler = (f'<div class="kachel"><b class="wert">'
                   f'{html_text(_zaehler(auswertung))}</b>'
                   f'<span class="bezeichnung">im letzten Durchgang</span></div>'
                   if auswertung is not None else "")
    leer = len(luecken(register))
    luecke = (f'<div class="kachel"><b class="wert">{leer} {"Bereich" if leer == 1 else "Bereiche"} '
              f'ohne Testfälle</b><span class="bezeichnung">Lücken im Register'
              f'</span></div>')
    return '<div class="kennzahlen kacheln">' + erste + zaehler + luecke + "</div>"


NIE_GELAUFEN = "nie gelaufen"
# Alles ausser bestanden, in der Reihenfolge von STATUS, dann nie gelaufen.
STATI_REIHENFOLGE = tuple(s for s in STATUS if s != "bestanden") + (NIE_GELAUFEN,)


def _zusammenfassung(register: Register, bereich_id: str) -> str:
    """'14 Fälle · 1 fehlgeschlagen' aus dem letzten Lauf je nicht stillgelegtem
    Testfall; ohne Auffälligkeit 'alle bestanden'. Stillgelegte zählen nicht
    mit und werden genannt."""
    faelle = [f for f in register.testfaelle if f.bereich == bereich_id]
    aktiv = [f for f in faelle if not f.stillgelegt]
    zaehler: dict[str, int] = {}
    for fall in aktiv:
        lauf = letzter_lauf(register.laeufe, fall.id)
        stand = lauf.status if lauf else NIE_GELAUFEN
        zaehler[stand] = zaehler.get(stand, 0) + 1
    teile = [f"{len(aktiv)} {'Fall' if len(aktiv) == 1 else 'Fälle'}"]
    offen = [f"{zaehler[s]} {status_anzeige(s)}"
             for s in STATI_REIHENFOLGE if s in zaehler]
    if offen:
        teile += offen
    elif aktiv:
        teile.append("alle bestanden")
    if len(faelle) > len(aktiv):
        teile.append(f"{len(faelle) - len(aktiv)} stillgelegt, nicht mitgezählt")
    return " · ".join(teile)


def _bereichskarte(register: Register, geaenderte_bereiche: set[str]) -> str:
    felder = []
    for bereich in register.bereiche.liste:
        farbe = bereich_farbe(register, bereich.id)
        etiketten = ""
        if bereich.id in geaenderte_bereiche:
            etiketten += '<span class="etikett">geändert</span>'
        if farbe == "leer":
            etiketten += '<span class="etikett">leer</span>'
        felder.append(
            f'<a class="bereich {farbe}" href="#bereich-{html_text(bereich.id)}">'
            f'<b>{html_text(bereich.id)}</b>'
            f'<span class="name">{html_text(bereich.name)}</span>'
            f'<span class="anzahl">{html_text(_zusammenfassung(register, bereich.id))}</span>{etiketten}</a>')
    return '<div class="bereichskarte">' + "".join(felder) + "</div>"


def _letzter_lauf_zelle(register: Register, kennung: str) -> str:
    lauf = letzter_lauf(register.laeufe, kennung)
    if lauf is None:
        return "nie"
    return f"{_status_marke(lauf.status)} {datum_anzeige(lauf.datum)}"


def _zeile(register: Register, fall: Testfall) -> str:
    stillgelegt = ' <span class="etikett">stillgelegt</span>' if fall.stillgelegt else ""
    grenzfall = _testfall_verweis(fall.grenzfall_von) if fall.grenzfall_von else "–"
    grenzfall = f"von {grenzfall}" if fall.grenzfall_von else grenzfall
    return (f"<tr><td>{_testfall_verweis(fall.id)}</td>"
            f"<td>{html_text(fall.titel)}{stillgelegt}</td>"
            f"<td>{html_text(fall.art)}</td>"
            f"<td>{'ja' if fall.regression else 'nein'}</td>"
            f"<td>{grenzfall}</td>"
            f"<td>{_letzter_lauf_zelle(register, fall.id)}</td></tr>")


def _bereich_abschnitt(register: Register, bereich_id: str, name: str) -> str:
    kopf = (f'<section id="bereich-{html_text(bereich_id)}">'
            f"<h2>{html_text(name)} ({html_text(bereich_id)})</h2>")
    faelle = [f for f in register.testfaelle if f.bereich == bereich_id]
    if not faelle:
        return kopf + "<p>Noch keine Testfälle.</p></section>"
    spalten = ("ID", "Titel", "Art", "Regression", "Grenzfall", "Letzter Lauf")
    return (kopf + "<table><thead><tr>"
            + "".join(f"<th>{s}</th>" for s in spalten)
            + "</tr></thead><tbody>"
            + "".join(_zeile(register, f) for f in sorted(faelle, key=lambda f: f.id))
            + "</tbody></table></section>")


def tests_inhalt(register: Register, auswertung: Freigabe | None,
                 geaenderte_bereiche: set[str]) -> str:
    """Seite Tests (Layout B): Kacheln, Bereichskarte, je Bereich eine Tabelle."""
    return "\n".join(
        ["<h1>Tests</h1>", _kacheln(register, auswertung),
         _bereichskarte(register, geaenderte_bereiche)]
        + [_bereich_abschnitt(register, b.id, b.name)
           for b in register.bereiche.liste])


def _kopf_testfall(fall: Testfall, register: Register) -> str:
    namen = {b.id: b.name for b in register.bereiche.liste}
    etiketten = [f"Bereich {namen.get(fall.bereich, fall.bereich)}",
                 f"Regression {'ja' if fall.regression else 'nein'}",
                 f"Priorität {fall.prioritaet}", f"Art {fall.art}"]
    if fall.grenzfall_von:
        etiketten.append(f"Grenzfall von {fall.grenzfall_von}")
    if fall.stillgelegt:
        etiketten.append("stillgelegt")
    marken = "".join(f'<span class="etikett">{html_text(e)}</span>' for e in etiketten)
    return (f"<h1>{html_text(fall.id)} {html_text(fall.titel)}</h1>"
            f'<p class="etiketten">{marken}</p>')


def _kasten(fall: Testfall, namen: tuple[str, ...], klasse: str,
            zusatz: str = "") -> str:
    teile = [f"<h2>{html_text(n)}</h2>{_text(fall.abschnitte[n])}"
             for n in namen if fall.abschnitte.get(n)]
    if not teile:
        return ""
    attribut = f' class="{klasse}"' if klasse else ""
    return f"<section{attribut}>{zusatz}" + "".join(teile) + "</section>"


def _herkunft(fall: Testfall) -> str:
    zeilen = [f"<dt>Herkunft</dt><dd>{html_text(HERKUNFT_ANZEIGE[fall.herkunft])}</dd>",
              f"<dt>Angelegt</dt><dd>{datum_anzeige(fall.angelegt)}</dd>"]
    if fall.aenderung:
        zeilen.append(f"<dt>Änderung</dt><dd>{html_text(fall.aenderung)}</dd>")
    if fall.eintrag:
        zeilen.append(f'<dt>Eintrag</dt><dd><a href="{eintrag_verweis(fall.eintrag, 1)}">'
                      f"{html_text(fall.eintrag)}</a></dd>")
    if fall.issue:
        zeilen.append(f"<dt>Issue</dt><dd>{html_text(fall.issue)}</dd>")
    return "<section><h2>Herkunft</h2><dl>" + "".join(zeilen) + "</dl></section>"


def _schritte(fall: Testfall) -> str:
    if not fall.schritte:
        return ""
    spalten = ("#", "Wo", "Tun", "Eingabe", "Worauf achten")
    return ("<section><h2>Schritte</h2><table><thead><tr>"
            + "".join(f"<th>{html_text(s)}</th>" for s in spalten)
            + "</tr></thead><tbody>"
            + "".join("<tr>" + "".join(f"<td>{html_text(schritt.get(s, ''))}</td>"
                                       for s in spalten) + "</tr>"
                      for schritt in fall.schritte)
            + "</tbody></table></section>")


def _grenzfall_tabelle(fall: Testfall, register: Register) -> str:
    ids = grenzfaelle(register).get(fall.id, [])
    titel = {f.id: f.titel for f in register.testfaelle}
    if not ids:
        return "<section><h2>Grenzfälle</h2><p>Keine eigenen Grenzfälle.</p></section>"
    zeilen = "".join(
        f"<tr><td>{_testfall_verweis(kennung, '')}</td>"
        f"<td>{html_text(titel[kennung])}</td>"
        f"<td>{_letzter_lauf_zelle(register, kennung)}</td></tr>"
        for kennung in ids)
    return ("<section><h2>Grenzfälle</h2><table><thead><tr><th>ID</th>"
            "<th>Titel</th><th>Letzter Lauf</th></tr></thead><tbody>"
            + zeilen + "</tbody></table></section>")


def _lauf_html(lauf: Lauf, gueltigkeit: dict[str, str]) -> str:
    umgebung = [f"{html_text(lauf.branch)} @ {_commit(lauf.commit)}"]
    for angabe in (lauf.datenstand, lauf.browser):
        if angabe:
            umgebung.append(html_text(angabe))
    teile = [
        f'<article class="lauf status-{html_text(lauf.status)}">',
        f'<h3><time datetime="{html_text(lauf.datum)}">'
        f"{datum_anzeige(lauf.datum)} {html_text(lauf.zeit)}</time> "
        f"{_status_marke(lauf.status)}</h3>",
        f'<p class="angaben">{html_text(lauf.wer)} &middot; '
        f"{html_text(lauf.ausfuehrung)} &middot; "
        f"{' / '.join(umgebung)}</p>"]
    if lauf.durchgang:
        teile.append(f'<p>Durchgang <a href="../durchgaenge.html#durchgang-'
                     f'{html_text(lauf.durchgang)}">{html_text(lauf.durchgang)}</a></p>')
    grund = gueltigkeit.get(lauf.datei, "")
    if grund:
        teile.append('<p class="ungueltig">Zählt nicht für die Freigabe: '
                     f"{html_text(grund)}</p>")
    teile.append(_text(lauf.ergebnis, 4))
    if lauf.fehler:
        teile.append(f'<p class="fehler">{html_text(lauf.fehler)}</p>')
    if lauf.belege:
        teile.append('<ul class="belege">' + "".join(
            f"<li>{_beleg_html(b)}</li>" for b in lauf.belege) + "</ul>")
    if lauf.unklar_was or lauf.unklar_fehlt:
        teile.append(
            '<div class="kasten-unklar"><h4>Unklar</h4>'
            f"{_text(lauf.unklar_was, 5)}<h4>Fehlt</h4>"
            f"{_text(lauf.unklar_fehlt, 5)}</div>")
    if lauf.grund:
        teile.append(f"<h4>Grund</h4>{_text(lauf.grund, 5)}")
    teile.append("</article>")
    return "".join(teile)


def testfall_inhalt(testfall: Testfall, register: Register,
                    gueltigkeit: dict[str, str]) -> str:
    """Seite tests/<ID>.html; `gueltigkeit` nennt je Lauf-Datei den Grund,
    warum er für die Freigabe nicht zählt."""
    laeufe = sorted((l for l in register.laeufe if l.testfall == testfall.id),
                    key=lambda l: lauf_reihenfolge(l.datei), reverse=True)
    laeufe_html = ("".join(_lauf_html(l, gueltigkeit) for l in laeufe)
                   or "<p>Noch kein Lauf.</p>")
    abdeckung = testfall.abschnitte.get("Nicht abgedeckte Grenzfälle", "")
    stuecke = [
        _kopf_testfall(testfall, register),
        _kasten(testfall, ("Worum es geht", "Bestanden, wenn",
                           "Fehlgeschlagen, wenn"), "kasten-ziel"),
        _herkunft(testfall),
        _kasten(testfall, ("Vorbedingungen",), ""),
        _kasten(testfall, ("Testdaten",), ""),
        _schritte(testfall),
        _kasten(testfall, ("Zurücksetzen",), "kasten-zuruecksetzen"),
        _kasten(testfall, ("Technische Prüfung",), "technisch",
                '<p class="hinweis">nicht für Tester</p>'),
        _grenzfall_tabelle(testfall, register),
        (f"<section><h2>Nicht abgedeckte Grenzfälle</h2>{_text(abdeckung)}</section>"
         if abdeckung else ""),
        f"<section><h2>Läufe</h2>{laeufe_html}</section>",
    ]
    return "\n".join(s for s in stuecke if s)


def _offene_punkte(auswertung: Freigabe) -> str:
    if not auswertung.offen:
        return ""
    punkte = []
    for kennung, grund in auswertung.offen:
        ziel = html_text(kennung) if kennung == OHNE_TESTFALL else _testfall_verweis(kennung)
        punkte.append(f"<li>{ziel}: {html_text(grund)}</li>")
    return '<ul class="offen">' + "".join(punkte) + "</ul>"


def _freigaben(durchgang: Durchgang) -> str:
    """Die Freigaben des Durchgangs: Wer welchen Testfall trotz blockiertem
    oder übersprungenem Lauf freigegeben hat, und warum."""
    if not durchgang.freigaben:
        return ""
    zeilen = "".join(
        f"<tr><td>{_testfall_verweis(kennung)}</td><td>{html_text(wer)}</td>"
        f"<td>{html_text(begruendung)}</td></tr>"
        for kennung, wer, begruendung in durchgang.freigaben)
    return ('<h3>Freigaben</h3><table class="freigaben"><thead><tr>'
            "<th>Testfall</th><th>wer</th><th>Begründung</th></tr></thead>"
            f"<tbody>{zeilen}</tbody></table>")


def _durchgang_html(durchgang: Durchgang, auswertung: Freigabe | None,
                    stand: str) -> str:
    marke = zaehler = offen = ""
    if auswertung is not None:
        marke = (f' <span class="status status-{_klasse(auswertung)}">'
                 f"{html_text(_stand(auswertung, stand))}</span>")
        zaehler = f"<p>{html_text(_zaehler(auswertung))}</p>"
        offen = _offene_punkte(auswertung)
    return (f'<section id="durchgang-{html_text(durchgang.id)}">'
            f"<h2>{html_text(durchgang.id)} &middot; "
            f"{html_text(durchgang.anlass)}{marke}</h2>"
            f'<p class="angaben">{datum_anzeige(durchgang.datum)} &middot; '
            f"{html_text(durchgang.branch)} @ {_commit(durchgang.commit)}</p>"
            f"{zaehler}{offen}{_freigaben(durchgang)}</section>")


def durchgaenge_inhalt(register: Register,
                       auswertungen: dict[str, Freigabe]) -> str:
    """Seite Durchgänge: neueste zuerst, mit Stand und offenen Punkten."""
    durchgaenge = sorted(register.durchgaenge, key=lambda d: d.id, reverse=True)
    if not durchgaenge:
        return "<h1>Durchgänge</h1>\n<p>Noch kein Durchgang.</p>"
    return "\n".join(
        ["<h1>Durchgänge</h1>"]
        + [_durchgang_html(d, auswertungen.get(d.id), durchgang_stand(register, d))
           for d in durchgaenge])
