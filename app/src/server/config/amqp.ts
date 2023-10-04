import { Channel, connect } from "amqplib";
import { env } from "~/env.mjs";

let channel: Channel;

async function initRabbitMQ() {
  try {
    const connection = await connect(env.RABBITMQ_URL);
    channel = await connection.createChannel();
    channel.assertQueue(env.RABBITMQ_QUEUE_NAME, { durable: false });
  } catch (error) {
    console.error("Failed to connect to RabbitMQ", error);
    throw error;
  }
}

export function getChannel() {
  if (!channel) {
    throw new Error("Channel is not initialized.");
  }
  return channel;
}

export function broadcastEvent<Payload>({
  event,
  payload,
  roomId,
}: {
  event: string;
  payload: Payload;
  roomId: string;
}) {
  const message = JSON.stringify({
    event,
    payload,
    roomId,
  });

  const channel = getChannel();

  channel.sendToQueue(env.RABBITMQ_QUEUE_NAME, Buffer.from(message));
}

// Call the initialization function during server startup.
initRabbitMQ();