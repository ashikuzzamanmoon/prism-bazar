import { randomUUID } from "crypto";

// ✅ FIXED: Use cryptographically secure UUID instead of weak random string
export const generateUniqueId = (prefix = ""): string => {
  const uuid = randomUUID().replace(/-/g, "").substring(0, 12); // 12-char secure ID
  return prefix ? `${prefix}${uuid}` : uuid;
};
