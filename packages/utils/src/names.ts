export function formatDisplayName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
): string {
  const parts = [firstName, lastName].filter(
    (part): part is string => typeof part === "string" && part.trim().length > 0,
  );
  return parts.length > 0 ? parts.join(" ") : "Unnamed member";
}

export function formatInitials(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
): string {
  const first = firstName?.trim().charAt(0) ?? "";
  const last = lastName?.trim().charAt(0) ?? "";
  const initials = `${first}${last}`.toUpperCase();
  return initials.length > 0 ? initials : "?";
}

export function initialsFromFullName(fullName: string): string {
  const [first, last] = fullName.trim().split(/\s+/);
  return formatInitials(first, last);
}
