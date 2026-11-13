/** Sagt nach einem Knopfdruck im Entwurf, dass hier nichts gestartet wird. */
export function EntwurfHinweis({ knopf }: { knopf: string | null }) {
  if (knopf === null) return null
  return (
    <p className="hinweis" role="status">
      Entwurf: „{knopf}“ startet hier nichts.
    </p>
  )
}
