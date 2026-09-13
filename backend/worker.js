const { Kafka } = require("kafkajs");
require("dotenv").config();
const { pool } = require("./db");

const kafka = new Kafka({
  clientId: "deployment-worker",
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "deploy-workers" });

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function startWorker() {
  await consumer.connect();
  await consumer.subscribe({ topic: "deploy.commands", fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const { deploymentId } = JSON.parse(message.value.toString());

      await pool.query("UPDATE deployments SET status = 'IN_PROGRESS' WHERE id = $1", [deploymentId]);
      await wait(3000);
      await pool.query("UPDATE deployments SET status = 'COMPLETED' WHERE id = $1", [deploymentId]);

      console.log(`Deployment ${deploymentId} completed`);
    },
  });

  console.log("Deployment worker is listening for commands");
}

startWorker().catch((error) => {
  console.error("Failed to start deployment worker", error);
  process.exit(1);
});
