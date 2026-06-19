/*
Author: rahn
Datum: 15.06.2026
Version: 1.0
Beschreibung: Brettnahe Startkreis-Fläche mit ausgewählter Handkarten-Vorschau.
*/
import type { DragEventHandler, KeyboardEventHandler, MouseEventHandler } from 'react'

interface SchlangenStartzoneProps {
  komponentenId: string
  startzoneTitelId: string
  hatEigeneSchlangen: boolean
  startzoneIstZielbereit: boolean
  dragOverStartzone: boolean
  ausgewaehlteHandkarteId: string | null
  startfaehrten?: Array<{ kartenId: string; onAuswaehlen: () => void }>
  onClick: MouseEventHandler<HTMLElement>
  onKeyDown: KeyboardEventHandler<HTMLElement>
  onDragOver: DragEventHandler<HTMLElement>
  onDrop: DragEventHandler<HTMLElement>
}

export default function SchlangenStartzone({
  komponentenId,
  startzoneTitelId,
  hatEigeneSchlangen,
  startzoneIstZielbereit,
  dragOverStartzone,
  ausgewaehlteHandkarteId,
  startfaehrten = [],
  onClick,
  onKeyDown,
  onDragOver,
  onDrop,
}: SchlangenStartzoneProps) {
  const zeigeStartfaehrten = !ausgewaehlteHandkarteId && startfaehrten.length > 0

  return (
    <div
      className={`schlangen-startzone schlangen-startzone--magiekreis${hatEigeneSchlangen ? '' : ' schlangen-startzone--leer'}${startzoneIstZielbereit ? ' schlangen-startzone--zielbereit' : ''}${dragOverStartzone ? ' schlangen-startzone--dragover' : ''}`}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <button
        type="button"
        className={`schlangen-startzone__hauptflaeche schlangen-startzone--magiekreis${hatEigeneSchlangen ? '' : ' schlangen-startzone--leer'}${startzoneIstZielbereit ? ' schlangen-startzone--zielbereit' : ''}${dragOverStartzone ? ' schlangen-startzone--dragover' : ''}`}
        aria-labelledby={startzoneTitelId}
        aria-describedby={`${komponentenId}-startzone-hinweis${startzoneIstZielbereit && ausgewaehlteHandkarteId ? ` ${komponentenId}-startzone-vorschau` : ''}`}
        onClick={onClick}
        onKeyDown={onKeyDown}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <span className="schlangen-startzone__badge">Startkreis</span>
        <strong id={startzoneTitelId} className="schlangen-startzone__titel">Neue Schlange starten</strong>
        <span className="schlangen-startzone__titel">Leuchtender Startplatz</span>
        <span id={`${komponentenId}-startzone-hinweis`} className="schlangen-drop-hinweis">
          Ziehe eine Farbkarte hierher oder klicke die passende Start-Schaltfläche.
        </span>
        {startzoneIstZielbereit && ausgewaehlteHandkarteId && (
          <span id={`${komponentenId}-startzone-vorschau`} className="schlangen-startzone__vorschau">
            <span className="schlangen-startzone__vorschau-label">Startkarte</span>
            <strong className="schlangen-startzone__vorschau-id">{ausgewaehlteHandkarteId}</strong>
            <span>Klick auf den Startkreis legt diese Karte als neue Schlange.</span>
          </span>
        )}
      </button>
      {zeigeStartfaehrten && (
        <ol className="schlangen-startzone__faehrten" aria-label="Startfährten im Startkreis">
          {startfaehrten.map(({ kartenId, onAuswaehlen }) => (
            <li key={kartenId} className="schlangen-startzone__faehrte">
              <button
                type="button"
                className="schlangen-startzone__faehrte-button"
                aria-label={`Startfährte ${kartenId} als neue Schlange starten`}
                title={`Startfährte: ${kartenId} als neue Schlange starten`}
                onClick={(event) => {
                  event.stopPropagation()
                  onAuswaehlen()
                }}
              >
                <span>Startfährte</span>
                <strong className="schlangen-startzone__faehrte-id">{kartenId}</strong>
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
