#!/usr/bin/env node

require("dotenv").config();

const mongoose = require("mongoose");
const readline = require("readline");
const colors = require("colors/safe");

const fs = require("fs");
const path = require("path");

const {
  createClient,
  renameClient,
  regenerateClientCredentials,
  activateClient,
  deactivateClient,
  getClient,
  getClients,
} = require("./actions");

const historyFilePath = path.join(__dirname, "../.cli-history");

const loadHistory = () => {
  if (fs.existsSync(historyFilePath)) {
    return fs
      .readFileSync(historyFilePath, "utf-8")
      .split("\n")
      .filter(Boolean);
  }
  return [];
};

const saveHistory = (history) => {
  fs.writeFileSync(historyFilePath, history.join("\n"));
};

const parseTokens = (tokens, { arguments = {}, flags = {} }) => {
  const result = { arguments: {}, flags: {} };

  const parseValue = (value, type) => {
    switch (type) {
      case "string": {
        return value;
      }

      case "number": {
        const num = Number(value);
        if (isNaN(num)) throw new Error(`Invalid number: ${value}`);
        return num;
      }

      case "boolean": {
        if (value === undefined || value === "true") return true;
        if (value === "false") return false;
        throw new Error(`Invalid boolean value: ${value}`);
      }

      default: {
        throw new Error(`Unknown type: ${type}`);
      }
    }
  };

  for (const key in arguments) {
    const type = arguments[key];

    if (tokens.length === 0 || tokens[0].startsWith("--")) {
      throw new Error(`Missing "${key}" argument.`);
    }

    const value = tokens.shift();

    result.arguments[key] = parseValue(value, type);
  }

  while (tokens.length) {
    const token = tokens.shift();

    if (!token.startsWith("--")) {
      throw new Error(`Unexpected argument: ${token}`);
    }

    const [key, value] = token.split("=");

    if (!(key in flags)) {
      throw new Error(`Unknown flag: ${key}`);
    }

    result.flags[key] = parseValue(value, flags[key]);
  }

  return result;
};

const cli = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: colors.bold("quiz-ms") + colors.green.bold("> "),
  historySize: 100,
});

cli.history = loadHistory();

cli
  .on("line", async (input) => {
    const [command, ...tokens] = input.trim().split(" ");

    try {
      switch (command) {
        case "create-client": {
          const { arguments } = parseTokens(tokens, {
            arguments: { name: "string" },
          });

          await createClient({ name: arguments.name });
          break;
        }

        case "rename-client": {
          const { arguments } = parseTokens(tokens, {
            arguments: { id: "string", name: "string" },
          });

          await renameClient(arguments.id, arguments.name);
          break;
        }

        case "regenerate-client-credentials": {
          const { arguments } = parseTokens(tokens, {
            arguments: { id: "string" },
          });

          await regenerateClientCredentials(arguments.id);
          break;
        }

        case "activate-client": {
          const { arguments } = parseTokens(tokens, {
            arguments: { id: "string" },
          });

          await activateClient(arguments.id);
          break;
        }

        case "deactivate-client": {
          const { arguments } = parseTokens(tokens, {
            arguments: { id: "string" },
          });

          await deactivateClient(arguments.id);
          break;
        }

        case "get-client": {
          const { arguments } = parseTokens(tokens, {
            arguments: { id: "string" },
          });

          await getClient(arguments.id);
          break;
        }

        case "get-clients": {
          const { flags } = parseTokens(tokens, {
            flags: {
              "--page": "number",
              "--limit": "number",
            },
          });

          const page = flags["--page"];
          const limit = flags["--limit"];

          await getClients({ page, limit });
          break;
        }

        case "exit":
        case "quit":
          console.log("Goodbye!");
          saveHistory(cli.history);
          process.exit(0);

        default:
          console.log(colors.red.bold("[error]") + " Command not found.");
      }
    } catch (error) {
      console.log(colors.red.bold("[error]") + " " + error.message);
    }

    cli.prompt();
  })
  .on("close", () => {
    console.log("Goodbye!");

    saveHistory(cli.history);

    process.exit(0);
  });

const MONGO_URI = process.env.MONGO_URI;

const bootstrap = async () => {
  try {
    mongoose.connect(MONGO_URI);

    cli.prompt();
  } catch (e) {
    console.error(e);

    process.exit(1);
  }
};

bootstrap();
