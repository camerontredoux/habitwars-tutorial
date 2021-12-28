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
  async post(@Arg("id") id: number, @Ctx() ctx: MyContext) {
    return await ctx.em.findOne(Post, { id });
  }

  @Mutation(() => Post)
  async createPost(
    @Arg("id") id: number,
    @Arg("title") title: string,
    @Ctx() ctx: MyContext
  ) {
    const post = ctx.em.create(Post, { id, title });
    await ctx.em.persistAndFlush(post);
    return post;
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id") id: number,
    @Arg("title") title: string,
    @Ctx() ctx: MyContext
  ) {
    const post = await ctx.em.findOne(Post, { id });
    if (!post) {
      return null;
    }

    if (typeof title !== "undefined") {
      post.title = title;
      await ctx.em.persistAndFlush(post);
    }

    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg("id") id: number, @Ctx() ctx: MyContext) {
    try {
      const post = await ctx.em.getRepository(Post).findOneOrFail({ id });
      await ctx.em.getRepository(Post).removeAndFlush(post);
      return true;
    } catch (err) {
      return false;
    }
  }
}
