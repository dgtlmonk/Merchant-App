import "cypress-localstorage-commands";
import { setSettings } from "../../helpers/activation";
import { setToken } from "../../helpers/auth";

const apiServer = Cypress.env("api_server");

const mockSettings = {
  installation: {
    id: "61db758cae300b001f1829c2",
  },
  location: {
    id: "5d1b019745828f10b6c5eed1",
    name: "ION Orchard",
  },
  business: {
    tenantCode: "samsonitesg",
    name: "Samsonite Singapore",
    currency: "SGD",
    style: {
      light: {},
      dark: {},
    },
    logo: {
      original:
        "https://s3-ap-southeast-1.amazonaws.com/c3.perkd.me/logo/f41f3406-9701-40ba-b6c4-8153392f6f8c.jpg",
      thumbnail:
        "https://s3-ap-southeast-1.amazonaws.com/c3.perkd.me/logo/f41f3406-9701-40ba-b6c4-8153392f6f8c-thumbnail.jpg",
    },
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
  settings: {
    modules: {
      membership: {
        join: true,
      },
      orders: {
        search: true,
        create: true,
        cancel: true,
      },
    },
    membership: {
      allowSalesQualify: false,
    },
    orders: {},
    forms: {
      "membership-join": {
        type: "object",
        required: ["familyName", "givenName", "mobile"],
        properties: {
          familyName: {
            type: "string",
            title: "Family Name",
          },
          givenName: {
            type: "string",
            min: 1,
            title: "Given Name",
          },
          mobile: {
            type: "string",
            title: "Mobile",
          },
        },
      },
      "order-create": {
        type: "object",
        required: ["receipt"],
        properties: {
          receipt: {
            type: "string",
            title: "Receipt",
          },
          quantity: {
            type: "number",
            min: 1,
            title: "Quantity",
          },
          amount: {
            type: "number",
            title: "Amount",
          },
        },
      },
    },
  },
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
    setToken(
      "eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2NDQ1NjIwNTcsInRlbmFudCI6eyJjb2RlIjoic2Ftc29uaXRlc2cifSwidXNlciI6eyJpZCI6IjYxZDNjYjg5NmJhNDg2MDAxZTExZGFiZiIsInVzZXJuYW1lIjoiYnVnaXMiLCJlbWFpbCI6ImJ1Z2lzQHdhdmVvLmNvbSIsInN0YWZmSWQiOiI2MWQzY2I4MjRkZmU0MzAwMWQ3MGNkNjMiLCJyb2xlcyI6W3sibmFtZSI6Ik1lcmNoYW50In1dfSwiYWNjZXNzVG9rZW4iOiJvT0VxRTFaYmFiSzdRNGJJYXRnNGdxY3hveHVZZjc4cUE1eldKdlVtZlh4RG5PRjV2WkFUSWpKMGtzeE5Pc3hLIn0.__YDpixnDPDGTWNCzyHqqCScDqBTEWwQMUUmAhpo8HQ"
    );

    cy.viewport("ipad-2");
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
  });

  it("should proceed to order, given a result is returned from search and form is completed", () => {
    cy.intercept("GET", `${apiServer}/person/search?cardNumber=123451`, {
      fixture: "card-number-search-result",
    }).as("search");

    cy.intercept(`${apiServer}/orders`, {
      orderId: "61cd8f58bee8a7e5d787bbce",
      receipt: "1234588",
      currency: "SGD",
      amount: 800,
      status: "paid",
      personId: "61b1877790dcdc001d5a5253",
      membershipId: "61b1cfa19c1223001defdddf",
      createdAt: "2021-12-30T10:52:08.189Z",
    }).as("orders");

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

    cy.get("#root_receipt").type("s12340");
    cy.get("#root_quantity").type("1");
    cy.get("#root_amount").type("100");

    cy.get('[data-test="sales-confirm-btn"]').click();
    cy.wait("@orders").then((xhr) => {
      expect(xhr.request.body).to.haveOwnProperty("staff");
    });

    expect(cy.contains(/success/i)).to.exist;
  });

  it("should list matching members, given search result is more than one", () => {
    cy.intercept("GET", `${apiServer}/person/search?cardNumber=123451`, {
      fixture: "card-number-search-result-multiple",
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
    cy.get('[data-test="sales-confirm-btn"]').should("not.exist");
    cy.get('[data-test="card-number"]').should("not.exist");

    cy.get('[data-test="match-person"]').then((el) => {
      const c = el.length;

      expect(c).to.equals(2);
      expect(cy.contains(/joel pablo/i)).to.exist;
    });
  });

  it("should not proceed, given required inputs are missing", () => {
    cy.intercept("GET", `${apiServer}/person/search?cardNumber=123451`, {
      fixture: "card-number-search-result-multiple",
    }).as("search");

    cy.intercept(`${apiServer}/orders`, {
      orderId: "61cd8f58bee8a7e5d787bbce",
      receipt: "1234588",
      currency: "SGD",
      amount: 800,
      status: "paid",
      personId: "61b1877790dcdc001d5a5253",
      membershipId: "61b1cfa19c1223001defdddf",
      createdAt: "2021-12-30T10:52:08.189Z",
    }).as("orders");

    cy.visit("http://localhost:3000/?module=2");

    const searchBtn = cy.get('[data-test="search-icon-btn"]');
    const cardNumberInput = cy.get('[data-test="card-number"]');

    expect(cardNumberInput).to.exist;
    expect(searchBtn).to.exist;

    cardNumberInput.type("123451");
    cy.get('[data-test="no-match-notice"]').should("not.exist");
    cy.get('[data-test="search-icon-btn"]').click();

    cy.wait("@search");
    cy.get('[data-test="sales-confirm-btn"]').should("not.exist");
    cy.get('[data-test="card-number"]').should("not.exist");

    cy.get('[data-test="match-person"]').then((el) => {
      const c = el.length;

      expect(c).to.equals(2);
      expect(cy.contains(/joel pablo/i)).to.exist;

      // cy.get("#root_receipt").type("s12340");
      cy.get("#root_quantity").type("1");
      cy.get("#root_amount").type("100");

      el[1].click();

      cy.get('[data-test="sales-confirm-btn"]').click();
      cy.contains(/success/i).should("not.be.visible");
    });
  });

  it("should not proceed, given no matching result is present", () => {
    cy.intercept("GET", `${apiServer}/person/search?cardNumber=123451`, []).as(
      "search"
    );

    cy.intercept(`${apiServer}/orders`, {
      orderId: "61cd8f58bee8a7e5d787bbce",
      receipt: "1234588",
      currency: "SGD",
      amount: 800,
      status: "paid",
      personId: "61b1877790dcdc001d5a5253",
      membershipId: "61b1cfa19c1223001defdddf",
      createdAt: "2021-12-30T10:52:08.189Z",
    }).as("orders");

    cy.visit("http://localhost:3000/?module=2");

    const searchBtn = cy.get('[data-test="search-icon-btn"]');
    const cardNumberInput = cy.get('[data-test="card-number"]');

    expect(cardNumberInput).to.exist;
    expect(searchBtn).to.exist;

    cardNumberInput.type("123451");
    cy.get('[data-test="no-match-notice"]').should("not.exist");

    cy.get("#root_receipt").type("s12340");
    cy.get("#root_quantity").type("1");
    cy.get("#root_amount").type("100");

    cy.get('[data-test="sales-confirm-btn"]').click();
    cy.get('[data-test="match-person"]').should("not.exist");
  });

  it("should proceed to search, given all form inputs are completed", () => {
    cy.intercept("GET", `${apiServer}/person/search?cardNumber=123451`, {
      fixture: "card-number-search-result-multiple",
    }).as("search");

    cy.intercept(`${apiServer}/orders`, {
      orderId: "61cd8f58bee8a7e5d787bbce",
      receipt: "1234588",
      currency: "SGD",
      amount: 800,
      status: "paid",
      personId: "61b1877790dcdc001d5a5253",
      membershipId: "61b1cfa19c1223001defdddf",
      createdAt: "2021-12-30T10:52:08.189Z",
    }).as("orders");

    cy.visit("http://localhost:3000/?module=2");

    const searchBtn = cy.get('[data-test="search-icon-btn"]');
    const cardNumberInput = cy.get('[data-test="card-number"]');

    expect(cardNumberInput).to.exist;
    expect(searchBtn).to.exist;

    cardNumberInput.type("123451");
    cy.get('[data-test="no-match-notice"]').should("not.exist");

    cy.get("#root_receipt").type("s12340");
    cy.get("#root_quantity").type("1");
    cy.get("#root_amount").type("100");

    cy.get('[data-test="sales-confirm-btn"]').click();

    // expect(cy.contains(/success/i)).to.not.exist;
    // cy.get('[data-test="search-icon-btn"]').click();

    cy.wait("@search");
    // cy.get('[data-test="sales-confirm-btn"]').should("not.exist");
    // cy.get('[data-test="card-number"]').should("not.exist");

    cy.get('[data-test="match-person"]').then((el) => {
      const c = el.length;

      expect(c).to.equals(2);
      expect(cy.contains(/joel pablo/i)).to.exist;

      // cy.get("#root_receipt").type("s12340");
      cy.get("#root_quantity").type("1");
      cy.get("#root_amount").type("100");

      el[1].click();

      // cy.get('[data-test="sales-confirm-btn"]').click();
      // cy.contains(/success/i).should("not.be.visible");
    });
  });

  it("should add sales, given form inputs are valid", () => {
    cy.intercept("GET", `${apiServer}/person/search?cardNumber=123451`, {
      fixture: "card-number-search-result-multiple",
    }).as("search");

    cy.intercept(`${apiServer}/orders`, {
      orderId: "61cd8f58bee8a7e5d787bbce",
      receipt: "1234588",
      currency: "SGD",
      amount: 800,
      status: "paid",
      personId: "61b1877790dcdc001d5a5253",
      membershipId: "61b1cfa19c1223001defdddf",
      createdAt: "2021-12-30T10:52:08.189Z",
    }).as("orders");

    cy.visit("http://localhost:3000/?module=2");

    const searchBtn = cy.get('[data-test="search-icon-btn"]');
    const cardNumberInput = cy.get('[data-test="card-number"]');

    expect(cardNumberInput).to.exist;
    expect(searchBtn).to.exist;

    cardNumberInput.type("123451");
    cy.get('[data-test="no-match-notice"]').should("not.exist");
    cy.get('[data-test="search-icon-btn"]').click();

    cy.wait("@search");
    cy.get('[data-test="sales-confirm-btn"]').should("not.exist");
    cy.get('[data-test="card-number"]').should("not.exist");

    cy.get('[data-test="match-person"]').then((el) => {
      const c = el.length;

      expect(c).to.equals(2);
      expect(cy.contains(/joel pablo/i)).to.exist;

      el[1].click();
      cy.get("#root_receipt").type("s12340");
      cy.get("#root_quantity").type("1");
      cy.get("#root_amount").type("100");

      cy.get('[data-test="sales-confirm-btn"]').click();
      cy.wait("@orders");

      expect(cy.contains(/success/i)).to.exist;
    });
  });
});

export {};
