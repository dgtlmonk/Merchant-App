import "cypress-localstorage-commands";
import { setSettings } from "../../helpers/activation";
import { setToken } from "../../helpers/auth";

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

const formNoGivenName = {
  ...mockSettings,
  settings: {
    ...mockSettings.settings,
    forms: {
      ...mockSettings.settings.forms,
      "membership-join": {
        type: "object",
        required: ["familyName", "givenName", "mobile"],
        properties: {
          familyName: {
            type: "string",
            title: "Familia Name",
          },
          mobile: {
            type: "string",
            title: "Telepono",
          },
        },
      },
    },
  },
};

const formNoAmount = {
  ...mockSettings,
  settings: {
    ...mockSettings.settings,
    forms: {
      ...mockSettings.settings.forms,
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
        },
      },
    },
  },
};

describe("Form Settings", () => {
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
      cy.viewport("ipad-2");
    });

    it("should display form based on activation settings", () => {
      setSettings(formNoGivenName);
      setToken(
        "eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2NDQxNTE1MzAsInRlbmFudCI6eyJjb2RlIjoic2Ftc29uaXRlc2cifSwidXNlciI6eyJpZCI6IjYxZDNjYjg5NmJhNDg2MDAxZTExZGFiZiIsInVzZXJuYW1lIjoiYnVnaXMiLCJlbWFpbCI6ImJ1Z2lzQHdhdmVvLmNvbSIsInJvbGVzIjpbeyJuYW1lIjoiTWVyY2hhbnQifV19LCJhY2Nlc3NUb2tlbiI6IkszemdDTkJsdjlaM1hyYWFIMHNMTndMTFh0YUY5QUxCOXJqQ0hpYU1RMUFzZHoyRFpLcUtWbUdHTURRak91OWgifQ.j83nzx_qn5j_uyPeVlEMo7Gltb6mYS18n-6EaMerit8"
      );
      cy.visit("http://localhost:3000/?module=1");

      cy.get('[data-test="shop-card"]')
        .then((el) => {
          const c = el.length;

          expect(c).to.equals(2);
          el[0].click();

          expect(cy.contains(/classic/i)).to.exist;
          // issue-next-btn
        })
        .then(() => {
          cy.contains(/given/i).should("not.exist");
          cy.contains(/familia/i).should("exist");
          cy.contains(/telepono/i).should("exist");
        });
    });
  });

  describe.only("Add Sales ", () => {
    before(() => {
      cy.clearLocalStorageSnapshot();
      cy.saveLocalStorage();
    });

    after(() => {
      cy.clearLocalStorageSnapshot();
      cy.restoreLocalStorage();
    });

    beforeEach(() => {
      cy.viewport("ipad-2");
    });

    it("should display form based on activation settings", () => {
      setSettings(formNoAmount);
      setToken(
        "eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2NDQxNTE1MzAsInRlbmFudCI6eyJjb2RlIjoic2Ftc29uaXRlc2cifSwidXNlciI6eyJpZCI6IjYxZDNjYjg5NmJhNDg2MDAxZTExZGFiZiIsInVzZXJuYW1lIjoiYnVnaXMiLCJlbWFpbCI6ImJ1Z2lzQHdhdmVvLmNvbSIsInJvbGVzIjpbeyJuYW1lIjoiTWVyY2hhbnQifV19LCJhY2Nlc3NUb2tlbiI6IkszemdDTkJsdjlaM1hyYWFIMHNMTndMTFh0YUY5QUxCOXJqQ0hpYU1RMUFzZHoyRFpLcUtWbUdHTURRak91OWgifQ.j83nzx_qn5j_uyPeVlEMo7Gltb6mYS18n-6EaMerit8"
      );
      cy.visit("http://localhost:3000/?module=2");

      const searchBtn = cy.get('[data-test="search-icon-btn"]');
      const cardNumberInput = cy.get('[data-test="card-number"]');

      expect(cardNumberInput).to.exist;
      expect(searchBtn).to.exist;

      expect(cy.contains(/receipt/i)).to.exist;
      expect(cy.contains(/quantity/i)).to.exist;

      cy.contains(/mount/i).should("not.exist");
    });
  });
});

export {};
