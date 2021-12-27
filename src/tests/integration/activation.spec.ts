// sample.spec.ts created with Cypress

import "cypress-localstorage-commands";
import { setSettings, settingsKey } from "../../helpers/activation";

describe("Activation", () => {
  beforeEach(() => {
    cy.clearLocalStorage(settingsKey);
  });

  it("should redirect to login if local storage settings is present", () => {
    // TODO: refactor to App.start()

    setSettings({ i: "exist" });
    cy.visit("http://localhost:3000");

    cy.url().should("include", "login");

    // expect(settings).not.to.exist;

    // check localstorage
    // cy.setLocalStorage(settingsKey, JSON.stringify({ name: "joel" }));

    // const settings = getSettings();

    // expect(settings).to.exist;
  });
});

export {};
