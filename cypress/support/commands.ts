import "cypress-localstorage-commands";

Cypress.Commands.add("getBySel", (selector) => {
  return cy.get(`[data-test=${selector}]`);
});
