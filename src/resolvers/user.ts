import { User } from "../entities/User";
import { MyContext } from "../types";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";

import argon2 from "argon2";
import { __cookie__ } from "../constants";

@InputType()
class UserArguments {
  @Field()
  username: string;

  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async me(@Ctx() ctx: MyContext) {
    if (!ctx.req.session!.userId) {
      return null;
    }

    return await ctx.em.findOne(User, { id: ctx.req.session!.userId });
  }

  @Query(() => [User])
  async users(@Ctx() ctx: MyContext) {
    return await ctx.em.find(User, {});
  }

  @Query(() => User)
  async user(@Arg("id") id: number, @Ctx() ctx: MyContext) {
    return await ctx.em.findOne(User, { id });
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UserArguments,
    @Ctx() ctx: MyContext
  ) {
    if (options.username.length === 0) {
      return {
        errors: [
          {
            field: "username",
            message: "Username cannot be empty",
          },
        ],
      };
    }

    if (options.password.length < 3) {
      return {
        errors: [
          {
            field: "password",
            message: "Password must be longer than 2 characters",
          },
        ],
      };
    }
    const hashedPassword = await argon2.hash(options.password);
    const user = ctx.em.create(User, {
      username: options.username,
      password: hashedPassword,
    });
    try {
      await ctx.em.persistAndFlush(user);
    } catch (err) {
      if (err.code === "23505") {
        return {
          errors: [
            {
              field: "username",
              message: "Username already exists",
            },
          ],
        };
      }
    }

    ctx.req.session!.userId = user.id;
    ctx.req.session!.save();

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(@Arg("options") options: UserArguments, @Ctx() ctx: MyContext) {
    const user = await ctx.em.findOne(User, {
      username: options.username,
    });

    if (!user) {
      return {
        errors: [
          {
            field: "username",
            message: "Could not find a user with that username",
          },
        ],
      };
    }

    const valid = await argon2.verify(user.password, options.password);

    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "Incorrect password",
          },
        ],
      };
    }

    ctx.req.session!.userId = user.id;
    ctx.req.session!.save();

    return { user };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() ctx: MyContext) {
    return new Promise((resolve) =>
      ctx.req.session.destroy((err) => {
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }
        ctx.res.clearCookie(__cookie__);
        resolve(true);
      })
    );
  }
}
