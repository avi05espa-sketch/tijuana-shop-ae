/**
 * Format a timestamp (ms) as relative Spanish text: "hace 2m", "hace 1h", etc.
 */
export function formatDistanceToNow(ms: number): string {
  const diffMs = Date.now() - ms;
  if (diffMs < 0) return "ahora";
  const secs = Math.floor(diffMs / 1000);
  if (secs < 60) return `hace ${secs}s`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `hace ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `hace ${days}d`;
  const months = Math.floor(days / 30);
  if (months < 12) return `hace ${months} mes${months === 1 ? "" : "es"}`;
  const years = Math.floor(months / 12);
  return `hace ${years} año${years === 1 ? "" : "s"}`;
}
