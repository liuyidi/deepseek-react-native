import Constants from "expo-constants";

/** App semver from app.json / package.json (via Expo config). */
export function getAppVersion(): string {
  return Constants.expoConfig?.version ?? "1.0.0";
}

export function formatAppVersion(prefix = "v"): string {
  return `${prefix}${getAppVersion()}`;
}
