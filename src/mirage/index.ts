// mock api server
// https://miragejs.com/docs/getting-started/introduction/
import { createServer } from "miragejs";

const server = createServer({
  environment: "test",

  routes() {
    this.post("/cards/issue", () => ({
      cardNumber: "S0651022479",
      programId: "5d12e1a1e4a5c53fdd6fe352",
      programPriority: 1,
      tierLevel: 1,
      startTime: "2021-12-09T11:37:02.983Z",
      endTime: "2022-12-08T15:59:59.999Z",
      personId: "61589ce687d250001efa7e35",
      memberId: "61589ce7f3c74e00202b54cd",
      membershipId: "61b1ea5f9c1223001defdde5",
      state: "active",
      digitalCard: {
        id: "61b1ea5f5d2857001fd734ce",
        registeredAt: null,
        hiddenAt: null,
      },
      person: {
        familyName: "Lee",
        givenName: "Rose",
        fullName: "Rose Lee",
        gender: "",
        birthDate: "",
        email: "",
        mobile: {
          fullNumber: "6591269162",
          countryCode: "65",
          number: "91269162",
        },
      },
      createdAt: "2021-12-10T09:05:13.554Z",
      modifiedAt: null,
      deletedAt: null,
    }));

    this.get(
      "/programs",
      () =>
        [
          {
            programId: "5d12e1a1e4a5c53fdd6fe352",
            name: "Friends of Samsonite",
            tierList: [
              {
                level: 1,
                name: "Classic",
                digitalCard: {
                  masterId: "5d12e42018505e70e4ea6389",
                  image: {
                    front:
                      "https://s3-ap-southeast-1.amazonaws.com/s3staging.waveo.com/card/dbc322d3-07bf-4200-87ce-6a6ef557517a-front.jpg",
                    thumbnail:
                      "https://s3-ap-southeast-1.amazonaws.com/s3staging.waveo.com/card/dbc322d3-07bf-4200-87ce-6a6ef557517a-thumbnail.jpg",
                  },
                },
                enableIssuance: true,
              },
              {
                level: 2,
                name: "Black",
                digitalCard: {
                  masterId: "5d12e64318505e70e4ea638e",
                  image: {
                    front:
                      "https://s3-ap-southeast-1.amazonaws.com/s3staging.waveo.com/card/6bf4ddc4-5146-4811-8f4e-7bfd847c41f8-front.jpg",
                    thumbnail:
                      "https://s3-ap-southeast-1.amazonaws.com/s3staging.waveo.com/card/6bf4ddc4-5146-4811-8f4e-7bfd847c41f8-thumbnail.jpg",
                  },
                },
                enableIssuance: false,
              },
            ],
          },
        ] as any
    );

    this.get(
      "/validate",
      () =>
        ({
          business: {
            tenantCode: "samsonitesg",
            brandName: "Samsonite Singapore",
            logo: "https://s3-us-west-1.amazonaws.com/s3.perkd.me/logo/999a18d0-7c87-4aa0-af37-985cd281fd77.jpg",
            style: {
              color: {
                action: "#010101",
                background: "#EDEDED",
                text: "#5B6770",
              },
            },
          },
          program: {
            programId: "5d12e1a1e4a5c53fdd6fe352",
            name: "Friends of Samsonite",
            tierList: [
              {
                level: 1,
                name: "Classic",
                digitalCard: {
                  masterId: "5d12e42018505e70e4ea6389",
                  image: {
                    front:
                      "https://s3-ap-southeast-1.amazonaws.com/s3staging.waveo.com/card/dbc322d3-07bf-4200-87ce-6a6ef557517a-front.jpg",
                    thumbnail:
                      "https://s3-ap-southeast-1.amazonaws.com/s3staging.waveo.com/card/dbc322d3-07bf-4200-87ce-6a6ef557517a-thumbnail.jpg",
                  },
                },
                qualifiers: {
                  minSpend: 0,
                  maxSpend: 400,
                },
              },
              {
                level: 2,
                name: "Black",
                digitalCard: {
                  masterId: "5d12e64318505e70e4ea638e",
                  image: {
                    front:
                      "https://s3-ap-southeast-1.amazonaws.com/s3staging.waveo.com/card/6bf4ddc4-5146-4811-8f4e-7bfd847c41f8-front.jpg",
                    thumbnail:
                      "https://s3-ap-southeast-1.amazonaws.com/s3staging.waveo.com/card/6bf4ddc4-5146-4811-8f4e-7bfd847c41f8-thumbnail.jpg",
                  },
                },
                qualifiers: {
                  minSpend: 400,
                },
              },
            ],
          },
          widgets: {
            issueCard: true,
            addSales: true,
            search: true,
            history: true,
            settings: true,
          },
          addSales: {
            form: {
              type: "object",
              required: ["receipt", "purchasedAt"],
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
                purchasedAt: {
                  type: "string",
                  title: "Purchase At",
                },
              },
            },
          },
          issueCard: {
            form: {
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
          },
          history: {
            ttl: 172800000,
          },
        } as any)
    );
  },
});

export default server;
