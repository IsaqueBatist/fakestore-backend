import * as express from "express";

const server = express();
server.get("/", (req, res) => {
  res.send("Ola");
});

export { server };
