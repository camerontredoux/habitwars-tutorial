import { User } from "../entities/User";
import { MyContext } from "../types";
import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";

import argon2 from "argon2";
import { COOKIE_NAME, FORGOT_PASSWORD_PREFIX } from "../constants";
import UserArguments from "../types/UserArguments";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from "uuid";

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
  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() ctx: MyContext
  ): Promise<boolean> {
    const user = await ctx.em.findOne(User, { email });

    if (!user) return true;

    const token = v4();
    await ctx.redisClient.set(
      FORGOT_PASSWORD_PREFIX + token,
      user.id,
      "ex",
      60 * 60 * 24
    );

    await sendEmail(
      user.email,
      `<a href="http://localhost:3000/change-password/${token}">Change Password</a>`
    );

    return true;
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() ctx: MyContext): Promise<User | null> {
    if (!ctx.req.session!.userId) {
      return null;
    }

    return await ctx.em.findOne(User, { id: ctx.req.session!.userId });
  }

  @Query(() => [User])
  async users(@Ctx() ctx: MyContext): Promise<User[]> {
    return await ctx.em.find(User, {});
  }

  @Query(() => User)
  async user(
    @Arg("id") id: number,
    @Ctx() ctx: MyContext
  ): Promise<User | null> {
    return await ctx.em.findOne(User, { id });
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UserArguments,
    @Ctx() ctx: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);
    if (errors) {
      return { errors };
    }

    const hashedPassword = await argon2.hash(options.password);
    const user = ctx.em.create(User, {
      username: options.username,
      password: hashedPassword,
      email: options.email,
    });

    try {
      await ctx.em.persistAndFlush(user);
    } catch (err) {
      if (err.code === "23505") {
        return {
          errors: [
            {
              field: "username",
              message: "This username is already in use.",
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
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() ctx: MyContext
  ) {
    const user = await ctx.em.findOne(User, {
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });

    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "Login failed; Invalid username or password.",
          },
        ],
      };
    }

    const valid = await argon2.verify(user.password, password);

    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "Login failed; Invalid username or password.",
          },
        ],
      };
    }

    ctx.req.session!.userId = user.id;
    ctx.req.session!.save();

    return { user };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() ctx: MyContext): Promise<boolean> {
    return new Promise((resolve) =>
      ctx.req.session.destroy((err) => {
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }
        ctx.res.clearCookie(COOKIE_NAME);
        resolve(true);
      })
    );
  }
}
