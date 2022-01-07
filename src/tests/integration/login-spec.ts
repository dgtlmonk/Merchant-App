import "cypress-localstorage-commands";
import { deleteSettings, setSettings } from "../../helpers/activation";

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

describe("Login", () => {
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

  it("should display invalid link notice, given no settings is detected and activate url is not present", () => {
    deleteSettings();
    cy.visit("http://localhost:3000");
    expect(cy.contains(/no longer valid/i)).to.exist;
  });

  it("should display login, given unauthenticated ", () => {
    cy.visit("http://localhost:3000");
    cy.get('[data-test="login-btn"]').should("be.visible");
    // cy.wait("@login");
  });

  it("should display access denied, given login failed", () => {
    cy.intercept(`${apiServer}/login?tenant_code=samsonitesg`, {
      error: {
        statuscode: 401,
        message: "Login failed",
      },
    }).as("login");

    cy.visit("http://localhost:3000/");
    expect(cy.get('[data-test="login-btn"]')).to.exist;

    cy.get('[data-test="login-username"]').type("abc");
    cy.get('[data-test="login-password"]').type("abc");
    cy.get('[data-test="login-btn"]').click();

    cy.wait("@login");

    expect(cy.contains(/failed/i)).to.exist;
  });

  it("should display menu, given login success", () => {
    cy.intercept(`${apiServer}/login?tenant_code=samsonitesg`, {
      token:
        "eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2NDQxNTE1MzAsInRlbmFudCI6eyJjb2RlIjoic2Ftc29uaXRlc2cifSwidXNlciI6eyJpZCI6IjYxZDNjYjg5NmJhNDg2MDAxZTExZGFiZiIsInVzZXJuYW1lIjoiYnVnaXMiLCJlbWFpbCI6ImJ1Z2lzQHdhdmVvLmNvbSIsInJvbGVzIjpbeyJuYW1lIjoiTWVyY2hhbnQifV19LCJhY2Nlc3NUb2tlbiI6IkszemdDTkJsdjlaM1hyYWFIMHNMTndMTFh0YUY5QUxCOXJqQ0hpYU1RMUFzZHoyRFpLcUtWbUdHTURRak91OWgifQ.j83nzx_qn5j_uyPeVlEMo7Gltb6mYS18n-6EaMerit8",
    }).as("login");

    cy.visit("http://localhost:3000/");
    expect(cy.get('[data-test="login-btn"]')).to.exist;

    cy.get('[data-test="login-username"]').type("abc");
    cy.get('[data-test="login-password"]').type("abc");
    cy.get('[data-test="login-btn"]').click();

    cy.wait("@login");
    expect(cy.contains(/issue card/i)).to.exist;
  });
});

export {};
