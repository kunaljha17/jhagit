const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const http = require("http");
const { Server } = require("socket.io");
const mainRouter = require("./routes/main.router");

const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");
require("dotenv").config();

const { initRepo } = require("./controllers/init");
const { add } = require("./controllers/add");
const { commit } = require("./controllers/commit");
const { pullRepo } = require("./controllers/pull");
const { pushRepo } = require("./controllers/push");
const { revertRepo } = require("./controllers/revert");
const { getStatus } = require("./controllers/status");
const { getLog } = require("./controllers/log");
const { getDiff } = require("./controllers/diff");
const { cloneRepo } = require("./controllers/clone");
const { createBranch } = require("./controllers/branch");
const { checkout } = require("./controllers/checkout");
const { mergeBranch } = require("./controllers/merge");

yargs(hideBin(process.argv))
  .command("start", "Start a new server", {}, startServer)
  .command("init", "Initialise a new repository", {}, initRepo)
  .command("status", "Check status of working directory", {}, getStatus)
  .command("log", "Show commit log history", {}, getLog)
  .command(
    "branch [name]",
    "Create or list branches",
    (yargs) => {
      yargs.positional("name", {
        describe: "Branch name",
        type: "string",
      });
    },
    (argv) => {
      createBranch(argv.name);
    }
  )
  .command(
    "checkout <target>",
    "Checkout a branch or commit",
    (yargs) => {
      yargs.positional("target", {
        describe: "Branch or commit ID",
        type: "string",
      });
    },
    (argv) => {
      checkout(argv.target);
    }
  )
  .command(
    "merge <branch>",
    "Merge a branch into working tree",
    (yargs) => {
      yargs.positional("branch", {
        describe: "Target branch name",
        type: "string",
      });
    },
    (argv) => {
      mergeBranch(argv.branch);
    }
  )
  .command(
    "diff <file>",
    "Show changes in a file",
    (yargs) => {
      yargs.positional("file", {
        describe: "File to diff",
        type: "string",
      });
    },
    (argv) => {
      getDiff(argv.file);
    }
  )
  .command("clone", "Clone repository from R2 remote", {}, cloneRepo)
  .command(
    "add <file>",
    "Add a file to the repository",
    (yargs) => {
      yargs.positional("file", {
        describe: "file to add to the staging area",
        type: "string",
      });
    },
    (argv) => {
      add(argv.file);
    }
  )
  .command(
    "commit <message>",
    "Commit the staged files",
    (yargs) => {
      yargs.positional("message", {
        describe: "Commit message",
        type: "string",
      });
    },
    (argv) => {
      commit(argv.message);
    }
  )
  .command("push", "Push commits to remote S3/R2 storage", {}, pushRepo)
  .command("pull", "Pull commits from remote S3/R2 storage", {}, pullRepo)
  .command(
    "revert <commitID>",
    "File revert successfully",
    (yargs) => {
      yargs.positional("commitID", {
        description: "Commit ID to revert to",
        type: "string",
      });
    },
    (argv) => {
      revertRepo(argv.commitID);
    }
  )
  .demandCommand(1, "You need at least one command")
  .help().argv;

function startServer() {
  const app = express();
  const port = process.env.PORT || 3002;
  app.use(bodyParser.json());
  app.use(express.json());

  const mongoURI = process.env.MONGODB_URI;
  if (mongoURI) {
    mongoose
      .connect(mongoURI)
      .then(() => console.log("MongoDB connected successfully!"))
      .catch((err) => console.error("Unable to connect to MongoDB:", err));
  } else {
    console.warn("Warning: MONGODB_URI is not defined in environment variables.");
  }

  const allowedOrigins = [
    "http://localhost:5173",              // local dev frontend
    "https://jhagit.pages.dev",           // your Cloudflare Pages frontend (update if custom domain)
  ];

  app.use(cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }));

  app.use("/", mainRouter);

  let user = "test";
  const httpServer = http.createServer(app);

  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinRoom", (userID) => {
      user = userID;
      socket.join(userID);
    });
  });

  httpServer.listen(port, () => {
    console.log(`jhaGit REST & CLI Server running on PORT ${port}`);
  });
}