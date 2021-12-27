import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/post";
import config from "./mikro-orm.config";
import express from "express";

const main = async () => {
  const orm = await MikroORM.init(config);
  await orm.getMigrator().up();

  const app = express();
  app.listen(4000, () => {
    console.log(`Server started at http://localhost:4000`);
  });
};

main();
