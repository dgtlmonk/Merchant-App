import "cypress-localstorage-commands";
import { setSettings } from "../../helpers/activation";
import { setToken } from "../../helpers/auth";

const apiServer = Cypress.env("api_server");
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
    currency: "SGD",
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

describe("Search Existing Member", () => {
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
    setToken(
      "eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2NDQxNTE1MzAsInRlbmFudCI6eyJjb2RlIjoic2Ftc29uaXRlc2cifSwidXNlciI6eyJpZCI6IjYxZDNjYjg5NmJhNDg2MDAxZTExZGFiZiIsInVzZXJuYW1lIjoiYnVnaXMiLCJlbWFpbCI6ImJ1Z2lzQHdhdmVvLmNvbSIsInJvbGVzIjpbeyJuYW1lIjoiTWVyY2hhbnQifV19LCJhY2Nlc3NUb2tlbiI6IkszemdDTkJsdjlaM1hyYWFIMHNMTndMTFh0YUY5QUxCOXJqQ0hpYU1RMUFzZHoyRFpLcUtWbUdHTURRak91OWgifQ.j83nzx_qn5j_uyPeVlEMo7Gltb6mYS18n-6EaMerit8"
    );
    cy.viewport("ipad-2");
  });

  it("should display existing member prompt, given search returns a result", () => {
    cy.intercept("GET", `${apiServer}/person/search?q=919455`, {
      fixture: "search-result-single.json",
    }).as("search");

    cy.visit("http://localhost:3000/?module=1");

    const searchBtn = cy.get('[data-test="person-search"]');
    searchBtn.click();

    cy.get("input").type("919455");
    cy.get('[data-test="person-query-btn"]').click();
    cy.wait("@search");

    expect(cy.contains(/existing member/i)).to.exist;
  });

  it("should prompt card already issued, given search result is the same person the user is searching", () => {
    cy.intercept("GET", `${apiServer}/person/search?q=919455`, {
      fixture: "search-result-single.json",
    }).as("search");

    cy.visit("http://localhost:3000/?module=1");

    const searchBtn = cy.get('[data-test="person-search"]');
    searchBtn.click();

    cy.get("input").type("919455");
    cy.get('[data-test="person-query-btn"]').click();
    cy.wait("@search");

    expect(cy.contains(/existing member/i)).to.exist;
    cy.get('[data-test="person-query-same-person-btn"]').click(); // user clicked 'Yes'  for matched result

    expect(cy.contains(/card already issued/i)).to.exist;
  });

  it.only("should proceed to issue card, given search result is not the same person the user is searching", () => {
    cy.intercept("GET", `${apiServer}/person/search?q=919455`, {
      fixture: "search-result-single.json",
    }).as("search");

    cy.visit("http://localhost:3000/?module=1");

    const searchBtn = cy.get('[data-test="person-search"]');
    searchBtn.click();

    cy.get("input").type("919455");
    cy.get('[data-test="person-query-btn"]').click();
    cy.wait("@search");

    expect(cy.contains(/existing member/i)).to.exist;
    cy.get('[data-test="person-query-same-person-btn"]').click(); // user clicked 'Yes'  for matched result

    expect(cy.contains(/card already issued/i)).to.exist;
  });

  it.only("should display list of matched result, given search returns more than one result", () => {
    cy.intercept("GET", `${apiServer}/person/search?q=919455`, {
      fixture: "search-result-multiple.json",
    }).as("search");

    cy.visit("http://localhost:3000/?module=1");

    const searchBtn = cy.get('[data-test="person-search"]');
    searchBtn.click();

    cy.get("input").type("919455");
    cy.get('[data-test="person-query-btn"]').click();
    cy.wait("@search");

    cy.get('[data-test="match-person"]').then((el) => {
      const c = el.length;

      expect(c).to.equals(2);
    });
  });
});

export {};
