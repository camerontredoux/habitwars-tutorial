import { Options } from "@mikro-orm/core";
import path from "path";
import { __prod__ } from "./constants";
import { Post } from "./entities/post";
import { User } from "./entities/User";

const config: Options = {
  migrations: {
    path: path.join(__dirname, "./migrations"),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  entities: [Post, User],
  dbName: "habitwarsdb",
  type: "postgresql",
  debug: !__prod__,
  user: "camtredoux",
};

export default config;
