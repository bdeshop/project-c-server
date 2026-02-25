import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Khela88 Betting Platform API",
      version: "1.0.0",
      description:
        "Complete API documentation for the Khela88 betting platform",
      contact: {
        name: "API Support",
        email: "support@khela88.com",
      },
    },
    servers: [
      {
        url: "http://localhost:8000",
        description: "Development server",
      },
      {
        url: "https://api.bettingsite.com",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT Authorization header using the Bearer scheme",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            email: { type: "string" },
            password: { type: "string" },
            country: { type: "string" },
            currency: { type: "string" },
            phoneNumber: { type: "string" },
            player_id: { type: "string" },
            balance: { type: "number" },
            profileImage: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        PaymentMethod: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            description: { type: "string" },
            image: { type: "string" },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Promotion: {
          type: "object",
          properties: {
            _id: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
            image: { type: "string" },
            discount: { type: "number" },
            isActive: { type: "boolean" },
            startDate: { type: "string", format: "date-time" },
            endDate: { type: "string", format: "date-time" },
          },
        },
        Transaction: {
          type: "object",
          properties: {
            _id: { type: "string" },
            userId: { type: "string" },
            amount: { type: "number" },
            type: {
              type: "string",
              enum: ["deposit", "withdrawal", "bet", "win"],
            },
            status: {
              type: "string",
              enum: ["pending", "completed", "failed"],
            },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: { type: "string" },
            message: { type: "string" },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts"],
};

export const specs = swaggerJsdoc(options);
