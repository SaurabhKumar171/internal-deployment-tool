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
      "/api/v1/servers": {
        post: {
          summary: "Create a server",
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
  },
  apis: [],
});

module.exports = swaggerSpec;
