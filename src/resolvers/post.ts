import { Post } from "../entities/Post";
import { MyContext } from "../types";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  posts(@Ctx() ctx: MyContext) {
    return ctx.em.find(Post, {});
  }

  @Query(() => Post, { nullable: true })
  post(@Arg("_id") _id: number, @Ctx() ctx: MyContext) {
    return ctx.em.findOne(Post, { _id });
  }

  @Mutation(() => Post)
  async createPost(
    @Arg("title") title: string,
    @Arg("name") name: string,
    @Arg("id") _id: number,
    @Arg("email") email: string,
    @Ctx() ctx: MyContext
  ) {
    const post = ctx.em.create(Post, { title, name, _id, email });
    await ctx.em.persistAndFlush(post);
    return post;
  }
}
