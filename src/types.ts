export enum VIEWS {
  LOGIN = "login",
  IDLE = "idle",
  MENU = "menu",
  ISSUE_CARD = "issue card",
  ADD_SALES = "add sales",
  HISTORY = "history",
  SALES = "sales",
  SETTINGS = "settings",
  DENIED = "access denied",
  CONFIRN_NEW_SETTINGS = "settings change",
}

export const uiSchema = {
  "ui:options": { label: false },
  // done: {
  //   "ui:widget": "select", // could also be "select"
  // },
  // mobile: {
  //   phoneNumber: {
  //     "ui:widget": "select", // could also be "select"
  //   },
  // },
};

export const schema = {
  type: "object",
  required: ["givenName", "familyName", "mobile"],
  properties: {
    givenName: {
      title: "given name",
      type: "string",
    },
    familyName: {
      title: "family name",
      type: "string",
    },
    mobile: {
      type: "string",
      title: "mobile",
    },
  },
};
