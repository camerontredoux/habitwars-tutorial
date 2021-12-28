import { User } from "../entities/User";
import { MyContext } from "../types";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  Query,
  Resolver,
} from "type-graphql";

import argon2, { hash } from "argon2";

@InputType()
class UserArguments {
  @Field()
  id: number;

  @Field()
  username: string;

  @Field()
  password: string;
}

@Resolver()
export class UserResolver {
  @Query(() => [User])
  async users(@Ctx() ctx: MyContext) {
    return await ctx.em.find(User, {});
  }

  @Query(() => User)
  async user(@Arg("id") id: number, @Ctx() ctx: MyContext) {
    return await ctx.em.findOne(User, { id });
  }

  @Mutation(() => User)
  async register(
    @Arg("options") options: UserArguments,
    @Ctx() ctx: MyContext
  ) {
    const hashedPassword = await argon2.hash(options.password);
    const user = ctx.em.create(User, {
      id: options.id,
      username: options.username,
      password: hashedPassword,
    });
    await ctx.em.persistAndFlush(user);

    return user;
  }
}
