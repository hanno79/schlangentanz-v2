// Sucht Schritt s und Saat N mit roh(s, N) === N: dann gäbe kiSaatAmTisch ohne die letzte Zeile die Partiesaat zurück.
// Bitweise Suche: Bit b von imul(x, K) hängt nur von den Bits 0..b von x ab.
const EIGEN = 2 ** 31
const K = 0x85ebca6b
const roh = (schritt, p) => (((Math.imul((schritt + 1) ^ 0x5bd1e995, 0x9e3779b1) ^ Math.imul(p, K)) >>> 0) | EIGEN) >>> 0
function loese(c) {
  const stapel = [[0, 0]]
  while (stapel.length > 0) {
    const [x, b] = stapel.pop()
    if (b === 31) {
      const n = (x | EIGEN) >>> 0
      if (((c ^ Math.imul(n, K)) | EIGEN) >>> 0 === n) return n
      continue
    }
    for (const bit of [0, 1]) {
      const y = (x | (bit << b)) >>> 0
      const p = Math.imul(y, K) >>> 0
      if ((((c >>> b) ^ (p >>> b)) & 1) === bit) stapel.push([y, b + 1])
    }
  }
  return null
}
const funde = []
for (let s = 0; s < 5000 && funde.length < 5; s++) {
  const c = Math.imul((s + 1) ^ 0x5bd1e995, 0x9e3779b1) >>> 0
  const n = loese(c)
  if (n !== null) funde.push({ schritt: s, saat: n, roh: roh(s, n) })
}
console.log(JSON.stringify(funde))
