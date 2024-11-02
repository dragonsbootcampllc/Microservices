#!/usr/bin/env node

require("dotenv").config();
require("../job-scheduler/worker"); // just to initalize worker

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");
const colors = require("colors/safe");

const { createServer } = require("http");

const routes = require("./routes");

const app = express();

app.use(cors());
app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(routes);

const server = createServer(app);

const PORT = Number(process.env.PORT);
const MONGO_URI = process.env.MONGO_URI;

const bootstrap = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    server.listen(PORT, () => {
      console.log(colors.green.bold("[server]") + ` Listening on port ${PORT}`);
    });
  } catch (error) {
    console.error(error);

    process.exit(1);
  }
};

bootstrap();
