const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "deployment-api",
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
});

const producer = kafka.producer();

async function initKafkaProducer() {
  await producer.connect();
  console.log("Connected to Kafka producer");
}

async function publishDeployEvent(payload) {
  await producer.send({
    topic: "deploy.commands",
    messages: [{ value: JSON.stringify(payload) }],
  });
}

module.exports = { initKafkaProducer, publishDeployEvent };
