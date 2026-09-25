let inFlightMe: Promise<any> | null = null;
let cachedMe: any = null;

export async function getCurrentUser(force = false): Promise<any> {
  if (cachedMe && !force) {
    return cachedMe;
  }
  if (inFlightMe) {
    return inFlightMe;
  }

  inFlightMe = (async () => {
    try {
      const basePath =
        process.env.NODE_ENV === "production" ? "/meeting_notice" : "";
      const res = await fetch(`${basePath}/api/auth/me`);
      if (res.ok) {
        cachedMe = await res.json();
        return cachedMe;
      }
      return null;
    } catch {
      return null;
    } finally {
      inFlightMe = null;
    }
  })();

  return inFlightMe;
}

export function clearUserCache() {
  cachedMe = null;
  inFlightMe = null;
}
