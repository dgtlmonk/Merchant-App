/// <reference types="cypress" />

import { configure } from "@testing-library/cypress";
import "./commands";

configure({ testIdAttribute: "data-test" });

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to select DOM element by data-cy attribute.
       * @example cy.getBySel('greeting')
       */
      getBySel(selector: string): Chainable<Element | any>;
    }
  }
}
