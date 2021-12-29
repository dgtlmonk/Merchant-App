// sample.spec.ts created with Cypress

import "cypress-localstorage-commands";
import { createServer } from "miragejs";
import { getSettings, setSettings } from "../../helpers/activation";

describe("Activation", () => {
  let server;

  before(() => {
    cy.saveLocalStorage();
  });

  after(() => {
    cy.clearLocalStorageSnapshot();
    cy.restoreLocalStorage();
  });

  beforeEach(() => {
    server = createServer({});
  });

  afterEach(() => {
    server.shutdown();
  });

  it("should display access denied notice, given no settings is detected and activate url is not present", () => {
    cy.visit("http://localhost:3000");

    expect(cy.contains(/denied/i)).to.exist;
  });

  it.only("should display settings conflict warning, given existing config is detected", () => {
    // setSettings({
    //   installationId: "61cba27f6bbf03002050a2ba",
    //   location: {
    //     id: "5d1b019745828f10b6c5eed1",
    //     name: "ION Orchard",
    //   },
    // });

    // TODO: pass callback url with different location
    cy.visit("http://localhost:3000/activate?callback=someurl");
    // const settings = getSettings();
    // const location = settings.location;

    expect(cy.contains(/currently setup/i)).to.exist;
  });

  it.skip("should override local settings, given user accept change settings source", () => {
    expect(true).to.be.true;
  });

  it.skip("should update local settings, given activate params is present", () => {
    cy.visit(
      "http://localhost:3000/activate?callback=https://some-call-back.io"
    );
    cy.url().should("include", "login");
  });

  it.skip("should parse settings, given localstorage settings  is detected", () => {
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
