import type { UpdateEntry } from "@/types/update";

export function sortUpdatesByDate(entries: UpdateEntry[]) {
  return [...entries].sort((left, right) => right.date.localeCompare(left.date));
}
