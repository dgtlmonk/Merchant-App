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
  CONFIRM_INSTALL = "confirm install",
  CONFIRN_NEW_SETTINGS = "settings change",
}

export const uiSchema = {
  "ui:options": { label: false },
};

// TODO: add custom field width
export const uiSchemaAddSales = {
  ...uiSchema,
  receipt: {
    classNames: "w-3/5",
  },
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
    // mobile: {
    //   type: "string",
    //   title: "mobile",
    // },
  },
};

export const activateParams = {
  app: {
    id: "me.merchant",
    version: "4.0.0",
    env: "prod",
  },
};

export enum QUALIFY_TYPES {
  NO = "no",
  YES = "yes",
  CONFIRM = "confirm_person",
}
