const { Queue } = require("bullmq");

const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = Number(process.env.REDIS_PORT);

const queue = new Queue("queue", {
  connection: {
    host: REDIS_HOST,
    port: REDIS_PORT,
    maxRetriesPerRequest: null,
  },
});

module.exports = queue;
