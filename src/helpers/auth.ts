import jwtDecode from "jwt-decode";

export const jwtKey = btoa("perkd__merchant__jwt");

export function getToken() {
  // TODO: handle broken token
  // @ts-ignore
  const jwt = localStorage.getItem(jwtKey) || null;

  if (jwt) {
    return jwtDecode(jwt as string);
  }

  return null;
}

export function setToken(token: string) {
  localStorage.setItem(jwtKey, token);
}

export function deleteToken() {
  localStorage.removeItem(jwtKey);
}
