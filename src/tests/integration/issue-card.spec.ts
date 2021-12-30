// sample.spec.ts created with Cypress

import "cypress-localstorage-commands";
import { setSettings } from "../../helpers/activation";

const mockSettings = {
  installationId: "61cba27f6bbf03002050a2ba",
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

describe("Issue Card", () => {
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

  it.skip("should display display login, given unauthenticated", () => {
    // TODO: implement
    cy.visit("http://localhost:3000/?mod=1");
    expect(cy.contains(/login/i)).to.exist;
  });

  it("should display all cards, given `canIssue` field is set to true", () => {
    cy.visit("http://localhost:3000/?module=1");
    cy.get('[data-test="shop-card"]').then((el) => {
      const c = el.length;

      expect(c).to.equals(2);
    });
  });

  it.skip("should enable user to search for existing member", () => {
    cy.visit("http://localhost:3000/?module=1");
    // @ts-ignore
    expect(cy.getBySel("person-search")).to.exist;
  });

  it.only("should only submit completed form", () => {
    cy.visit("http://localhost:3000/?module=1");

    cy.get('[data-test="shop-card"]').then((el) => {
      const c = el.length;

      expect(c).to.equals(2);
      el[1].click();

      expect(cy.contains(/black/i)).to.exist;
    });
  });
});

export {};
