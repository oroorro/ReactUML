import { UniqueId } from "../types";

export function generateUniqueId():UniqueId {
    const timestamp = Date.now().toString(36);
    const randomValue = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${randomValue}`;
  }