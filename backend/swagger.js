const swaggerJSDoc = require("swagger-jsdoc");

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Internal Deployment Tool API",
      version: "1.0.0",
      description: "API for creating and monitoring deployments.",
    },
    paths: {
      "/api/v1/auth/register": {
        post: {
          summary: "Register a user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string", format: "email", example: "user@example.com" },
                    password: { type: "string", format: "password" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "User registered" },
            400: { description: "Missing required fields" },
            409: { description: "Email is already registered" },
            500: { description: "User registration failed" },
          },
        },
      },
      "/api/v1/auth/login": {
        post: {
          summary: "Log in and receive a JWT",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string", format: "email", example: "user@example.com" },
                    password: { type: "string", format: "password" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "JWT set in an HttpOnly token cookie",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string", example: "Logged in successfully" },
                    },
                  },
                },
              },
            },
            400: { description: "Missing required fields" },
            401: { description: "Invalid credentials" },
            500: { description: "Login failed" },
          },
        },
      },
      "/api/v1/auth/logout": {
        post: {
          summary: "Log out and clear the JWT cookie",
          responses: {
            204: { description: "Logged out" },
          },
        },
      },
      "/api/v1/auth/me": {
        get: {
          summary: "Get the current user",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Current user" },
            401: { description: "Authentication required" },
            404: { description: "User not found" },
          },
        },
      },
      "/api/v1/servers": {
        post: {
          summary: "Create a server",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "ip_address", "path"],
                  properties: {
                    name: { type: "string", example: "production-web-1" },
                    ip_address: { type: "string", example: "192.0.2.10" },
                    path: { type: "string", example: "/var/www/app" },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: "Server created",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      id: { type: "string", format: "uuid" },
                      user_id: { type: "string", format: "uuid" },
                      name: { type: "string" },
                      ip_address: { type: "string" },
                      path: { type: "string" },
                    },
                  },
                },
              },
            },
            400: { description: "Missing required fields" },
            500: { description: "Server creation failed" },
          },
        },
        get: {
          summary: "List servers",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Servers",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string", format: "uuid" },
                        user_id: { type: "string", format: "uuid" },
                        name: { type: "string" },
                        ip_address: { type: "string" },
                        path: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
            500: { description: "Server lookup failed" },
          },
        },
      },
      "/api/v1/deploy": {
        post: {
          summary: "Create a deployment",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["server_id", "branch"],
                  properties: {
                    server_id: { type: "string", format: "uuid" },
                    branch: { type: "string", example: "main" },
                  },
                },
              },
            },
          },
          responses: {
            202: {
              description: "Deployment accepted",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      deploymentId: { type: "string", format: "uuid" },
                    },
                  },
                },
              },
            },
            400: { description: "Missing required fields" },
            500: { description: "Deployment creation failed" },
          },
        },
      },
      "/api/v1/deploy/{eventId}": {
        get: {
          summary: "Get deployment status",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "eventId",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" },
            },
          ],
          responses: {
            200: {
              description: "Deployment status",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      branch: { type: "string" },
                      status: { type: "string", example: "PENDING" },
                      logs: { type: "string", nullable: true },
                    },
                  },
                },
              },
            },
            404: { description: "Deployment not found" },
            500: { description: "Deployment lookup failed" },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: [],
});

module.exports = swaggerSpec;
