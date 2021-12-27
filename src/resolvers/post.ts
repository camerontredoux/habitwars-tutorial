import { Post } from "../entities/Post";
import { MyContext } from "../types";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  async posts(@Ctx() ctx: MyContext) {
    return await ctx.em.find(Post, {});
  }

  @Query(() => Post, { nullable: true })
  async post(@Arg("_id") _id: number, @Ctx() ctx: MyContext) {
    return await ctx.em.findOne(Post, { _id });
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

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id") _id: number,
    @Arg("title") title: string,
    @Ctx() ctx: MyContext
  ) {
    const post = await ctx.em.findOne(Post, { _id });
    if (!post) {
      return null;
    }

    if (typeof title !== "undefined") {
      post.title = title;
      await ctx.em.persistAndFlush(post);
    }

    return post;
  }
}
