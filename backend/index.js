const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
require("dotenv").config();
const { initializeDatabase } = require("./db");
const { initKafkaProducer } = require("./kafka");
const swaggerSpec = require("./swagger");
const authRoutes = require("./routes/authRoutes");
const serverRoutes = require("./routes/serverRoutes");
const deployRoutes = require("./routes/deployRoutes");

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/servers", serverRoutes);
app.use("/api/v1/deploy", deployRoutes);

async function startServer() {
  try {
    await initializeDatabase();
    await initKafkaProducer();

    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to initialize services", error);
    process.exit(1);
  }
}

startServer();
