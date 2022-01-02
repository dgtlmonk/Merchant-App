// sample.spec.ts created with Cypress

import "cypress-localstorage-commands";
import { setSettings } from "../../helpers/activation";

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

  it("should show correct card, given user card selection", () => {
    cy.visit("http://localhost:3000/?module=1");

    cy.get('[data-test="shop-card"]').then((el) => {
      const c = el.length;

      expect(c).to.equals(2);
      el[1].click();

      expect(cy.contains(/black/i)).to.exist;
    });
  });

  it("should only submit completed form", () => {
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
        cy.intercept(`${apiServer}/membership/qualify`, {
          qualify: "no",
          person: {
            activeMemberships: [
              {
                membershipId: "61b1cfa19c1223001defdddf",
                programId: "5d12e1a1e4a5c53fdd6fe352",
                tierLevel: 1,
                startTime: "2021-12-09T09:42:56.504Z",
                endTime: "2022-12-08T15:59:59.000Z",
                cardNumber: "S0650012050",
                registeredAt: "2021-12-29T12:39:28.759Z",
              },
            ],
          },
        }).as("qualify");

        let nextBtn = cy.get('[data-test="issue-next-btn"]');

        nextBtn.click();
        cy.get('[data-test="title-display-as"]').should("not.exist");

        // NOTICE: this may break if form schema source is different
        cy.get("#root_givenName").type("Joel");
        cy.get("#root_familyName").type("Pablo");
        cy.get("#root_mobile").type("+639194550938");

        nextBtn = cy.get('[data-test="issue-next-btn"]');
        nextBtn.click();

        cy.wait("@qualify");
      });
  });

  it("should display 'Card already issued', given customer is not qualified.", () => {
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
        cy.intercept(`${apiServer}/membership/qualify`, {
          qualify: "no",
          person: {
            id: "61b1877790dcdc001d5a5253",
            familyName: "Lee",
            givenName: "Rose",
            fullName: "Rose Lee",
            name: {
              order: "givenfamily",
              language: null,
              salutation: null,
              display: "Rose Lee",
            },
            phones: [
              {
                id: "7eba0b6210566146ef7e8d02",
                fullNumber: "6591269162",
                type: "mobile",
                countryCode: "65",
                areaCode: "",
                number: "91269162",
                regionCode: "SG",
                lineType: "mobile",
                optIn: true,
                valid: true,
              },
            ],
            activeMemberships: [
              {
                membershipId: "61b1cfa19c1223001defdddf",
                programId: "5d12e1a1e4a5c53fdd6fe352",
                tierLevel: 1,
                startTime: "2021-12-09T09:42:56.504Z",
                endTime: "2022-12-08T15:59:59.000Z",
                cardNumber: "S0650012050",
                registeredAt: "2021-12-29T12:39:28.759Z",
              },
            ],
          },
        }).as("qualify");

        let nextBtn = cy.get('[data-test="issue-next-btn"]');

        nextBtn.click();
        cy.get('[data-test="title-display-as"]').should("not.exist");

        // NOTICE: this may break if form schema source is different
        cy.get("#root_givenName").type("Joel");
        cy.get("#root_familyName").type("Pablo");
        cy.get("#root_mobile").type("+639194550938");

        nextBtn = cy.get('[data-test="issue-next-btn"]');
        nextBtn.click();

        cy.wait("@qualify");
        cy.contains(/remember to scan/i).should("not.exist");
        expect(cy.get('[data-test="notice-already-issued"]')).to.exist;
      });
  });

  it.only("should issue a card, given customer is qualified.", () => {
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
        cy.intercept(`${apiServer}/membership/qualify`, {
          qualify: "yes",
        }).as("qualify");

        cy.intercept(`${apiServer}/membership/join`, {
          personId: "61cfe36f1dabe90020b37e84",
          programId: "5d12e1a1e4a5c53fdd6fe352",
          tierLevel: 1,
          membershipId: "61cfe370bb1ec1001efb555c",
          cardNumber: "S0651022525",
          startTime: "2022-01-01T05:15:28.006Z",
          endTime: "2022-12-31T15:59:59.999Z",
        }).as("join");

        // nextBtn.click();
        // cy.get('[data-test="title-display-as"]').should("exist");

        // NOTICE: this may break if form schema source is different
        cy.get("#root_givenName").type("Joel");
        cy.get("#root_familyName").type("Pablo");
        cy.get("#root_mobile").type("+639194550938");

        let nextBtn = cy.get('[data-test="issue-next-btn"]');
        nextBtn = cy.get('[data-test="issue-next-btn"]');

        nextBtn.click();
        cy.wait("@qualify");

        const confirmBtn = cy.get('[data-test="issue-confirm-btn"]');

        confirmBtn.should("exist");
        confirmBtn.click();

        cy.wait("@join").should((xhr) => {
          const body = JSON.parse(xhr.request.body);

          expect(body).to.have.property(
            "programId",
            mockSettings.programs[0].programId
          );

          expect(body).to.have.property("installation");

          expect(body).to.have.property("tierLevel");
        });

        // cy.contains(/remember to scan/i).should("exist");
        // expect(cy.get('[data-test="notice-already-issued"]')).not.to.exist;
      });
  });
});

export {};
