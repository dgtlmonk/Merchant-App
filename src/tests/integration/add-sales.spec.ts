import "cypress-localstorage-commands";
import { setSettings } from "../../helpers/activation";

const apiServer = Cypress.env("api_server");

// cy.intercept(`${apiServer}/person/search`, {

const mockSettings = {
  installation: {
    id: "61cba27f6bbf03002050a2ba",
  },
  location: {
    id: "5d1b019745828f10b6c5eed1",
    name: "ION Orchard",
  },
  business: {
    tenantCode: "samsonitesg",
    style: {
      light: {},
      dark: {},
    },
    logo: {},
  },
  programs: [
    {
      programId: "5d12e1a1e4a5c53fdd6fe352",
      name: "Friends of Samsonite",
      tiers: [
        {
          level: 1,
          name: "Classic",
          card: {
            canIssue: true,
            image: {
              original:
                "https://s3-ap-southeast-1.amazonaws.com/s3staging.waveo.com/card/dbc322d3-07bf-4200-87ce-6a6ef557517a.jpg",
              thumbnail:
                "https://s3-ap-southeast-1.amazonaws.com/s3staging.waveo.com/card/dbc322d3-07bf-4200-87ce-6a6ef557517a-front.jpg",
            },
          },
        },
        {
          level: 2,
          name: "BLACK",
          card: {
            canIssue: true,
            image: {
              original:
                "https://s3-ap-southeast-1.amazonaws.com/s3staging.waveo.com/card/6bf4ddc4-5146-4811-8f4e-7bfd847c41f8.jpg",
              thumbnail:
                "https://s3-ap-southeast-1.amazonaws.com/s3staging.waveo.com/card/6bf4ddc4-5146-4811-8f4e-7bfd847c41f8-front.jpg",
            },
          },
        },
      ],
    },
  ],
};

describe("Add Sales", () => {
  before(() => {
    cy.clearLocalStorageSnapshot();
    cy.saveLocalStorage();
  });

  after(() => {
    cy.clearLocalStorageSnapshot();
    cy.restoreLocalStorage();
  });

  beforeEach(() => {
    setSettings(mockSettings);
    cy.viewport("ipad-2");
  });

  it.skip("should display login, given unauthenticated", () => {
    cy.visit("http://localhost:3000/?mod=1");
    expect(cy.contains(/login/i)).to.exist;
  });

  it("should show no match notice, given no result is returned from search", () => {
    cy.intercept("GET", `${apiServer}/person/search?cardNumber=123451`, {}).as(
      "search"
    );

    cy.visit("http://localhost:3000/?module=2");

    const searchBtn = cy.get('[data-test="search-icon-btn"]');
    const cardNumberInput = cy.get('[data-test="card-number"]');

    expect(cardNumberInput).to.exist;
    expect(searchBtn).to.exist;

    cardNumberInput.type("123451");
    cy.get('[data-test="no-match-notice"]').should("not.exist");

    cy.get('[data-test="search-icon-btn"]').click();
    cy.wait("@search");

    cy.get('[data-test="no-match-notice"]').should("exist");
  });

  it("should show match, given a result is returned from search", () => {
    cy.intercept("GET", `${apiServer}/person/search?cardNumber=123451`, {
      fixture: "card-number-search-result",
    }).as("search");

    cy.visit("http://localhost:3000/?module=2");

    const searchBtn = cy.get('[data-test="search-icon-btn"]');
    const cardNumberInput = cy.get('[data-test="card-number"]');

    expect(cardNumberInput).to.exist;
    expect(searchBtn).to.exist;

    cardNumberInput.type("123451");
    cy.get('[data-test="no-match-notice"]').should("not.exist");
    cy.get('[data-test="search-icon-btn"]').click();

    cy.wait("@search");
    cy.get('[data-test="no-match-notice"]').should("not.exist");
    expect(cy.contains(/teng austen/i)).to.exist;
  });

  it.only("should proceed to order, given a result is returned from search and form is completed", () => {
    cy.intercept("GET", `${apiServer}/person/search?cardNumber=123451`, {
      fixture: "card-number-search-result",
    }).as("search");

    cy.visit("http://localhost:3000/?module=2");

    const searchBtn = cy.get('[data-test="search-icon-btn"]');
    const cardNumberInput = cy.get('[data-test="card-number"]');

    expect(cardNumberInput).to.exist;
    expect(searchBtn).to.exist;

    cardNumberInput.type("123451");
    cy.get('[data-test="no-match-notice"]').should("not.exist");
    cy.get('[data-test="search-icon-btn"]').click();

    cy.wait("@search");
    cy.get('[data-test="no-match-notice"]').should("not.exist");
    expect(cy.contains(/teng austen/i)).to.exist;

    cy.get('[data-test="sales-receipt"]').type("abc");
    cy.get('[data-test="sales-qtty"]').type("10");
    cy.get('[data-test="sales-amount"]').type("100");
  });
});

export {};
