export enum VIEWS {
  LOGIN = "login",
  IDLE = "idle",
  MENU = "menu",
  ISSUE_CARD = "issue card",
  ADD_SALES = "add sales",
  HISTORY = "history",
  SALES = "sales",
  SETTINGS = "settings",
}

export const schema = {
  type: "object",
  required: ["name", "mobile"],
  properties: {
    name: {
      title: "",
      type: "object",
      required: ["givenName", "familyName"],
      properties: {
        familyName: {
          title: "family name",
          type: "string",
        },
        givenName: {
          title: "given name",
          type: "string",
        },
      },
    },
    mobile: {
      type: "string",
      phoneNumber: {
        type: "mobile",
      },
      title: "mobile",
    },
  },
};
