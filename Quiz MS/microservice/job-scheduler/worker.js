const { Worker } = require("bullmq");
const colors = require("colors/safe");

const { ModelsGenerator } = require("../models");

const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = Number(process.env.REDIS_PORT);

const endAttempt = async (collectionId, attemptId) => {
  const { Attempt } = ModelsGenerator.generate(collectionId);

  const attempt = await Attempt.findByIdAndUpdate(attemptId, { active: false });

  if (!attempt) {
    console.log(
      colors.green.bold("[scheduler]") +
        ` Attempt with id "${attemptId}" not found.`
    );
  }

  console.log(
    colors.green.bold("[scheduler]") + ` Attempt with id "${attemptId}" ended.`
  );
};

const worker = new Worker(
  "queue",
  async (job) => {
    switch (job.name) {
      case "end-attempt":
        const { collectionId, attemptId } = job.data;

        await endAttempt(collectionId, attemptId);

        break;
      default:
        console.warn(
          colors.green.bold("[scheduler]") + ` Unhandled job type: ${job.name}`
        );
    }
  },
  {
    connection: {
      host: REDIS_HOST,
      port: REDIS_PORT,
      maxRetriesPerRequest: null,
    },
  }
);

worker.on("completed", (job) => {
  console.log(colors.green.bold("[scheduler]") + ` Job ${job.id} completed.`);
});

worker.on("failed", (job, error) => {
  console.error(
    colors.green.bold("[scheduler]") + ` Job ${job.id} failed:`,
    error
  );
});

module.exports = worker;
