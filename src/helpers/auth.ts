import jwtDecode from "jwt-decode";

export const jwtKey = btoa("perkd__merchant__jwt");

export function getToken(): any {
  // TODO: handle broken token
  // @ts-ignore
  const jwt = localStorage.getItem(jwtKey) || null;

  if (jwt) {
    try {
      return jwtDecode(jwt as string);
    } catch {
      return null;
    }
  }

  return null;
}

export function setToken(token: string) {
  localStorage.setItem(jwtKey, token);
}

export function deleteToken() {
  localStorage.removeItem(jwtKey);
}

// export function isValidToken() {
//   try {
//     const token = getToken() as any;
//     let isExpired = false;

//     if (!token) {
//       return false;
//     }

//     console.log("token exp ", token.exp);
//     isExpired = Date.now() >= token?.exp * 1000;

//     return isExpired;
//   } catch {
//     return false;
//   }
// }
