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
    @Arg("id") _id: number,
    @Arg("title") title: string,
    @Ctx() ctx: MyContext
  ) {
    const post = ctx.em.create(Post, { _id, title });
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

  @Mutation(() => Boolean)
  async deletePost(@Arg("id") _id: number, @Ctx() ctx: MyContext) {
    try {
      const post = await ctx.em.getRepository(Post).findOneOrFail({ _id });
      await ctx.em.getRepository(Post).removeAndFlush(post);
      return true;
    } catch (err) {
      return false;
    }
  }
}
