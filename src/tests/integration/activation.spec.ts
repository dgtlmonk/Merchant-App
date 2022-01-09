import "cypress-localstorage-commands";
import { deleteSettings, setSettings } from "../../helpers/activation";

describe("Activation", () => {
  before(() => {
    cy.clearLocalStorageSnapshot();
    cy.saveLocalStorage();
  });

  after(() => {
    cy.clearLocalStorageSnapshot();
    cy.restoreLocalStorage();
  });

  beforeEach(() => {
    deleteSettings();
    cy.viewport("ipad-2");
  });

  it("should display invalid link notice, given no settings is detected and activate url is not present", () => {
    cy.visit("http://localhost:3000");
    expect(cy.contains(/no longer valid/i)).to.exist;
  });

  it("should display invalid link notice, given activate callback url fails", () => {
    cy.visit("http://localhost:3000/activate?callaback=idontexist");

    expect(cy.contains(/no longer/i)).to.exist;
  });

  it("should prompt confirm use app, given no local settings is detected", () => {
    cy.visit("http://localhost:3000/activate?callback=https://someurl.io");

    expect(cy.contains(/confirm you want to use app/i)).to.exist;
  });

  it("should store new settings, given no local settings is detected", () => {
    cy.intercept("POST", "https://someurl.io", {
      statusCode: 200,
      body: {
        location: {
          id: "5d1b019745828f10b6c5eed1",
          name: "New Dev Store",
        },
      },

      // fixture: "activate.json",
    }).as("activate");

    cy.visit("http://localhost:3000/activate?callback=https://someurl.io");

    const activateBtn = cy.get('[data-test="activate-btn"]');
    expect(activateBtn).to.exist;
    activateBtn.click();

    cy.wait("@activate");

    expect(cy.contains(/login/i)).to.exist;
    expect(cy.contains(/new dev/i)).to.exist;
  });

  it("should redirect to login by default, given local settings is detected", () => {
    setSettings({
      location: {
        id: "5d1tb019745828f10b6c5eed1",
        name: "Perkd Dev Store",
      },
    });
    cy.visit("http://localhost:3000");
    expect(cy.contains(/login/i)).to.exist;
  });

  it("should display settings conflict warning, given existing config is detected", () => {
    setSettings({
      installationId: "61cba27f6bbf03002050a2ba",
      location: {
        id: "5d1b019745828f10b6c5eed1",
        name: "Perkd Dev 123",
      },
    });

    cy.visit("http://localhost:3000/?a=https://someurl.io");

    expect(cy.contains(/currently setup/i)).to.exist;
    expect(cy.contains(/dev 123/i)).to.exist;
  });

  it("should override local settings, given user accept change settings source", () => {
    setSettings({
      installationId: "61cba27f6bbf03002050a2ba",
      location: {
        id: "5d1b019745828f10b6c5eed1",
        name: "Perkd Dev II ",
      },
    });

    cy.intercept("POST", "https://someurl.io", {
      statusCode: 200,
      body: {
        location: {
          id: "5d1b019745828f10b6c5eed1",
          name: "Awesome Store",
        },
      },
    }).as("activate");

    cy.visit("http://localhost:3000/?a=https://someurl.io");
    cy.get("#update-settings").click();
    cy.wait("@activate");

    expect(cy.contains(/awesome store/i)).to.exist;
  });

  it("should redirect to login, given user cancel change settings source", () => {
    setSettings({
      installationId: "61cba27f6bbf03002050a2ba",
      location: {
        id: "5d1b019745828f10b6c5eed1",
        name: "Perkd Dev II ",
      },
    });

    cy.visit("http://localhost:3000/activate?callback=https://someurl.io");

    expect(cy.contains(/currently setup/i)).to.exist;
    expect(cy.contains(/dev II/i)).to.exist;

    cy.get("#update-cancel").click();
    expect(cy.contains(/login/i)).to.exist;
  });
});

export {};
