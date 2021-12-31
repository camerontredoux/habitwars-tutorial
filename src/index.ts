import { MikroORM } from "@mikro-orm/core";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { ApolloServer } from "apollo-server-express";
import connectRedis from "connect-redis";
import cors from "cors";
import express from "express";
import session from "express-session";
import Redis from "ioredis";
import { buildSchema } from "type-graphql";
import { COOKIE_NAME, __prod__ } from "./constants";
import config from "./mikro-orm.config";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import { MyContext } from "./types";

declare module "express-session" {
  export interface Session {
    userId: number;
  }
}

const main = async () => {
  const orm = await MikroORM.init(config);
  await orm.getMigrator().up();

  const app = express();

  const RedisStore = connectRedis(session);
  const redisClient = new Redis();

  app.set("trust proxy", 1);
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        httpOnly: true,
        secure: __prod__,
        sameSite: "lax", // csrf, research
      },
      secret: "HIDDENLOLDONTEXPOSETHIS",
      saveUninitialized: false,
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({
      em: orm.em,
      req,
      res,
      redisClient,
    }),
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(4000, () => {
    console.log(`Server started at http://localhost:4000/graphql`);
  });
};

main();
