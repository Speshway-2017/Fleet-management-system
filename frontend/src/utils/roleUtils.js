export function normaliseRole(backendRole) {
  if (!backendRole) return null;
  const roleStr = backendRole.toString().toUpperCase().trim();
  if (roleStr.includes("ADMIN")) return "admin";
  if (roleStr.includes("MANAGER")) return "manager";
  return backendRole.toLowerCase();
}
