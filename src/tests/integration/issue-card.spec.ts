// sample.spec.ts created with Cypress

import "cypress-localstorage-commands";
import { setSettings } from "../../helpers/activation";
import { QUALIFY_TYPES } from "../../types";

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

  it("should display login, given unauthenticated", () => {
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

  it("should enable user to search for existing member", () => {
    cy.visit("http://localhost:3000/?module=1");
    // @ts-ignore
    expect(cy.getBySel("person-search")).to.exist;
  });

  it("should show correct card, given user card selection", () => {
    cy.visit("http://localhost:3000/?module=1");

    cy.get('[data-test="shop-card"]').then((el) => {
      const c = el.length;

      expect(c).to.equals(2);
      // el[1].click();

      // expect(cy.contains(/black/i)).to.exist;
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
          qualify: QUALIFY_TYPES.NO,
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
          fixture: "qualify-confirm-no",
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

  it("should issue a card, given customer is qualified.", () => {
    cy.visit("http://localhost:3000/?module=1");

    cy.get('[data-test="shop-card"]')
      .then((el) => {
        const c = el.length;

        expect(c).to.equals(2);
        el[0].click();

        expect(cy.contains(/classic/i)).to.exist;
      })
      .then(() => {
        cy.intercept(`${apiServer}/membership/qualify`, {
          qualify: QUALIFY_TYPES.YES,
        }).as("qualify");

        cy.intercept(`${apiServer}/membership/join`, {
          personId: "61cfe36f1dabe90020b37e84",
          programId: "5d12e1a1e4a5c53fdd6fe352",
          tierLevel: 1,
          membershipId: "61cfe370bb1ec1001efb555c",
          cardNumber: "S065102255",
          startTime: "2022-01-01T05:15:28.006Z",
          endTime: "2022-12-31T15:59:59.999Z",
        }).as("join");

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

        cy.wait("@join");
        expect(cy.get('[data-test="reminder-notice"]')).to.exist;

        expect(cy.contains(/S065102255/i)).to.exist;
      });
  });

  it("should prompt confirmation, given existing member is found", () => {
    cy.visit("http://localhost:3000/?module=1");

    cy.intercept(`${apiServer}/membership/qualify`, {
      fixture: "qualify-confirm-single",
    }).as("qualify");

    cy.intercept(`${apiServer}/membership/join`, {
      personId: "61cdac161dabe90020b37a69",
      programId: "5d12e1a1e4a5c53fdd6fe352",
      tierLevel: 1,
      membershipId: "61cdac16bb1ec1001efb5556",
      cardNumber: "S0651022524",
      startTime: "2021-12-30T12:54:46.164Z",
      endTime: "2022-12-29T15:59:59.999Z",
    }).as("join");

    cy.get('[data-test="shop-card"]').then((el) => {
      const c = el.length;

      expect(c).to.equals(2);
      el[0].click();

      expect(cy.contains(/classic/i)).to.exist;
    });

    // NOTICE: this may break if form schema source is different
    cy.get("#root_givenName").type("Joel");
    cy.get("#root_familyName").type("Pablo");
    cy.get("#root_mobile").type("639194550938");

    const nextBtn = cy.get('[data-test="issue-next-btn"]');

    nextBtn.click();
    cy.wait("@qualify");
    expect(cy.contains(/same person/i)).to.exist;

    const confirmBtn = cy.get('[data-test="confirm-person-btn"]');
    confirmBtn.click();
    expect(cy.contains(/card already/i)).to.exist;
  });

  it("should continue to join, given search member was found but not the same person", () => {
    cy.visit("http://localhost:3000/?module=1");

    cy.intercept(`${apiServer}/membership/qualify`, {
      fixture: "qualify-confirm-single",
    }).as("qualify");

    cy.intercept(`${apiServer}/membership/join`, {
      personId: "61cdac161dabe90020b37a69",
      programId: "5d12e1a1e4a5c53fdd6fe352",
      tierLevel: 1,
      membershipId: "61cdac16bb1ec1001efb5556",
      cardNumber: "S0651022524",
      startTime: "2021-12-30T12:54:46.164Z",
      endTime: "2022-12-29T15:59:59.999Z",
    }).as("join");

    cy.get('[data-test="shop-card"]').then((el) => {
      const c = el.length;

      expect(c).to.equals(2);
      el[0].click();

      expect(cy.contains(/classic/i)).to.exist;
    });

    // NOTICE: this may break if form schema source is different
    cy.get("#root_givenName").type("Joel");
    cy.get("#root_familyName").type("Pablo");
    cy.get("#root_mobile").type("639194550938");

    let nextBtn = cy.get('[data-test="issue-next-btn"]');

    nextBtn.click();
    cy.wait("@qualify");
    expect(cy.contains(/same person/i)).to.exist;

    let noBtn = cy.get('[data-test="confirm-false-btn"]');
    noBtn.click();
    cy.wait("@join");

    expect(cy.contains(/S0651022524/i)).to.exist;
  });

  it("should list user membership, given multiple matched membership result", () => {
    cy.visit("http://localhost:3000/?module=1");

    cy.intercept(`${apiServer}/membership/qualify`, {
      fixture: "qualify-confirm-multiple",
    }).as("qualify");

    cy.intercept(`${apiServer}/membership/join`, {
      personId: "61cdac161dabe90020b37a69",
      programId: "5d12e1a1e4a5c53fdd6fe352",
      tierLevel: 1,
      membershipId: "61cdac16bb1ec1001efb5556",
      cardNumber: "S0651022524",
      startTime: "2021-12-30T12:54:46.164Z",
      endTime: "2022-12-29T15:59:59.999Z",
    }).as("join");

    cy.get('[data-test="shop-card"]').then((el) => {
      const c = el.length;

      expect(c).to.equals(2);
      el[0].click();

      expect(cy.contains(/classic/i)).to.exist;
    });

    // NOTICE: this may break if form schema source is different
    cy.get("#root_givenName").type("Joel");
    cy.get("#root_familyName").type("Pablo");
    cy.get("#root_mobile").type("639194550938");

    let nextBtn = cy.get('[data-test="issue-next-btn"]');

    nextBtn.click();
    cy.wait("@qualify");

    cy.get('[data-test="match-person"]').then((el) => {
      const c = el.length;

      expect(c).to.equals(2);
    });
  });

  it("should join a member, given 'No Match' is selected from search result result", () => {
    cy.visit("http://localhost:3000/?module=1");

    cy.intercept(`${apiServer}/membership/qualify`, {
      fixture: "qualify-confirm-multiple",
    }).as("qualify");

    cy.intercept(`${apiServer}/membership/join`, {
      personId: "61cdac161dabe90020b37a69",
      programId: "5d12e1a1e4a5c53fdd6fe352",
      tierLevel: 1,
      membershipId: "61cdac16bb1ec1001efb5556",
      cardNumber: "S0651022524",
      startTime: "2021-12-30T12:54:46.164Z",
      endTime: "2022-12-29T15:59:59.999Z",
    }).as("join");

    cy.get('[data-test="shop-card"]').then((el) => {
      const c = el.length;

      expect(c).to.equals(2);
      el[0].click();

      expect(cy.contains(/classic/i)).to.exist;
    });

    // NOTICE: this may break if form schema source is different
    cy.get("#root_givenName").type("Joel");
    cy.get("#root_familyName").type("Pablo");
    cy.get("#root_mobile").type("639194550938");

    let nextBtn = cy.get('[data-test="issue-next-btn"]');

    nextBtn.click();
    cy.wait("@qualify");

    cy.get('[data-test="match-person"]').then((el) => {
      const c = el.length;

      expect(c).to.equals(2);
    });

    let noMatchBtn = cy.get('[data-test="no-match-btn"]');
    expect(noMatchBtn).to.exist;
    noMatchBtn.click();

    cy.wait("@join");
    expect(cy.contains(/S0651022524/i)).to.exist;
  });

  it("should show membership detail, give a search result item was selected", () => {
    cy.visit("http://localhost:3000/?module=1");

    cy.intercept(`${apiServer}/membership/qualify`, {
      fixture: "qualify-confirm-multiple",
    }).as("qualify");

    cy.intercept(`${apiServer}/membership/join`, {
      personId: "61cdac161dabe90020b37a69",
      programId: "5d12e1a1e4a5c53fdd6fe352",
      tierLevel: 1,
      membershipId: "61cdac16bb1ec1001efb5556",
      cardNumber: "S0651022524",
      startTime: "2021-12-30T12:54:46.164Z",
      endTime: "2022-12-29T15:59:59.999Z",
    }).as("join");

    cy.get('[data-test="shop-card"]').then((el) => {
      const c = el.length;

      expect(c).to.equals(2);
      el[0].click();

      expect(cy.contains(/classic/i)).to.exist;
    });

    cy.get("#root_givenName").type("Joel");
    cy.get("#root_familyName").type("Pablo");
    cy.get("#root_mobile").type("639194550938");

    let nextBtn = cy.get('[data-test="issue-next-btn"]');

    nextBtn.click();
    cy.wait("@qualify");

    cy.get('[data-test="match-person"]').then((el) => {
      const c = el.length;

      expect(c).to.equals(2);
      el[1].click();
      expect(cy.contains(/bao jennifer/i)).to.exist;
    });
  });
});

export {};
