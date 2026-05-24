
export function computeDaysRemaining(
  reviewedAt: string | null,
  followUpWeeks: number | null,
): number | null {
  if (!reviewedAt || !followUpWeeks) return null;
  const due = new Date(reviewedAt);
  due.setDate(due.getDate() + followUpWeeks * 7);
  const now = new Date();
  return Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function dueLabel(days: number): string {
  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) !== 1 ? "s" : ""} overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  if (days < 7) return `Due in ${days} days`;
  const weeks = Math.floor(days / 7);
  const rem = days % 7;
  if (rem === 0) return `Due in ${weeks} week${weeks !== 1 ? "s" : ""}`;
  return `Due in ${weeks}w ${rem}d`;
}

export function dueColor(days: number): string {
  if (days < 0) return "#ff5f7e";
  if (days <= 3) return "#ff5f7e";
  if (days <= 7) return "#ffbe3d";
  return "#00d4a8";
}

export function feelingColor(feeling: string): string {
  switch (feeling) {
    case "better": return "#00d4a8";
    case "worse":  return "#ff5f7e";
    default:       return "#ffbe3d";
  }
}

export function feelingIcon(feeling: string): string {
  switch (feeling) {
    case "better": return "😊";
    case "worse":  return "😔";
    default:       return "😐";
  }
}