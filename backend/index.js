const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser"); //json to js read and write use
const http = require("http");
const {Server} = require("socket.io");
const mainRouter = require("./routes/main.router");

const yargs = require("yargs");
const { hideBin } = require("yargs/helpers"); //use to get attribute which get from console cmd after space
require("dotenv").config();
const { initRepo } = require("./controllers/init");
const { add } = require("./controllers/add");
const { commit } = require("./controllers/commit");
const { pullRepo } = require("./controllers/pull");
const { pushRepo } = require("./controllers/push");
const { revertRepo } = require("./controllers/revert");
const { error } = require("console");
const { Socket } = require("dgram");

yargs(hideBin(process.argv))
  .command("start", "Start a new server", {}, startServer)
  .command("init", "Initialise a new repository", {}, initRepo)
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
    },
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
    },
  )
  .command("push", "Pull commits from S3", {}, pushRepo)
  .command("pull", "Push commits to S3", {}, pullRepo)
  .command(
    "revert <commitID>",
    "file revert successfully",
    (yargs) => {
      yargs.positional("commitID", {
        description: "Commit ID to revert to",
        type: "string",
      });
    },
    (argv) => {
      revertRepo(argv.commitID);
    },
  )
  .demandCommand(1, "You need at least one command")
  .help().argv;

function startServer() {
  const app = express();
  const port = process.env.PORT || 3002;
  app.use(bodyParser.json());
  app.use(express.json());
  // app.use(express.urlencoded({ extended: true }));
  

  const mongoURI = process.env.MONGODB_URI;
  mongoose
    .connect(mongoURI)
    .then(() => console.log("MongoDB is connected!"))
    .catch((err) => console.error("Unable to connect :", err));

  app.use(cors({origin:"*"}));

  app.use("/",mainRouter);
  
  let user = "test";

  const httServer = http.createServer(app);
  
  const io = new Server(httServer , {
    cors:{
      origin:"*",
      methods:["GET","POST"],
    },
  });

  io.on("connection",(socket)=>{
    socket.on("joinRoom",(userID)=>{
      user = userID;
      console.log("====");
      console.log(user);
      console.log("====");
      socket.join(userID);
    });
  });

  const db = mongoose.connection;
  db.once("open",async()=>{
    console.log("CRUD operations called");
    //CRUD Operations
  })

  httServer.listen(port,()=>{
    console.log(`Server is running on PORT ${port}`);
  });
}
