// sample.spec.ts created with Cypress

import { expect } from "chai";
import "cypress-localstorage-commands";
import { createServer } from "miragejs";
import { settingsKey } from "../../helpers/activation";

describe("Issue Card", () => {
  let server;

  beforeEach(() => {
    cy.clearLocalStorage(settingsKey);
    // deleteSettings();
    server = createServer({});
  });

  afterEach(() => {
    server.shutdown();
  });

  it("should be ok", () => {
    expect(true).to.be.true;
  });
});

export {};
