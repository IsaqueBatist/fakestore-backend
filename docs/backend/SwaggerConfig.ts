import swaggerJSDoc from "swagger-jsdoc";

const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "FakeStore API",
      version: "1.0.0",
      description: "Documentação do contrato da API FakeStore.",
      contact: {
        name: "Isaque Barbosa",
        url: "https://github.com/IsaqueBatist",
      },
    },
    servers: [
      {
        url: "http://localhost:3333",
        description: "Servidor de Desenvolvimento",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/server/routes/*.ts"],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
