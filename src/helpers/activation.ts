export const settingsKey = "perkd__merchant__1.0.1";

export function deleteSettings() {
  localStorage.removeItem(settingsKey);
}

export function getSettings() {
  // @ts-ignore
  return JSON.parse(localStorage.getItem(settingsKey)) || null;
}

export function setSettings(settings: object) {
  localStorage.setItem(settingsKey, JSON.stringify(settings));
}
