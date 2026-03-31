const K = 32;

/**
 * Calculate new ELO ratings for two players after a match.
 * Returns [newRatingA, newRatingB].
 */
export function calculateElo(
  ratingA: number,
  ratingB: number,
  winner: "a" | "b"
): [number, number] {
  const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  const expectedB = 1 - expectedA;

  const scoreA = winner === "a" ? 1 : 0;
  const scoreB = winner === "b" ? 1 : 0;

  const newRatingA = Math.round(ratingA + K * (scoreA - expectedA));
  const newRatingB = Math.round(ratingB + K * (scoreB - expectedB));

  return [newRatingA, newRatingB];
}
