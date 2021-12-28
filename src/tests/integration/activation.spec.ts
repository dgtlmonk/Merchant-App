// sample.spec.ts created with Cypress

import "cypress-localstorage-commands";
import { createServer } from "miragejs";
import {
  getSettings,
  setSettings,
  settingsKey,
} from "../../helpers/activation";

describe("Activation", () => {
  let server;

  beforeEach(() => {
    cy.clearLocalStorage(settingsKey);
    // deleteSettings();
    server = createServer({});
  });

  afterEach(() => {
    server.shutdown();
  });

  it("should redirect to login page, given callback is present in query params", () => {
    cy.visit("http://localhost:3000/?callback=/activateUrl");
    cy.url().should("include", "login");
  });

  it.only("should parse settings, given localstorage settings  is detected", () => {
    // server.get("/validate", {
    //   i: "too exist",
    // });

    // cy.intercept({
    //   method: "GET",
    //   url: "/validate",
    // }).as("validate");
    setSettings({ i: "exist" });

    cy.visit("http://localhost:3000/activate");

    // goes to validate
    // mock api
    // check updated settings
    // should redirect to login

    // check localstorage
    // cy.setLocalStorage(settingsKey, JSON.stringify({ name: "joel" }));

    const settings = getSettings();
    expect(settings).to.exist;

    // expect(settings).to.deep.equal({ i: "exists too" });
    // expect(settings).to.exist;
  });
});

export {};
