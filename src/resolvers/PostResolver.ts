import { Post } from "../entity/Post";
import { FieldError, ReqRes } from "../types";
import {
	Query,
	Mutation,
	ObjectType,
	Resolver,
	Field,
	InputType,
	Arg,
	Ctx,
	Int,
	ID,
} from "type-graphql";

const checkLoginStatus = require("../utils/checkLoginStatus");

@InputType()
class CreatePostInput {
	@Field()
	title: string;

	@Field()
	content: string;

	@Field({ nullable: true })
	subreddit?: string;
}

@InputType()
class UpdatePostInput {
	@Field(() => Int, { nullable: true })
	id: number;

	@Field({ nullable: true })
	title?: string;

	@Field({ nullable: true })
	content?: string;
}

@ObjectType()
class CreatePostResponse {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[];

	@Field(() => Post, { nullable: true })
	post?: Post;
}

@ObjectType()
class MutatePostResponse {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[];

	@Field(() => Boolean, { nullable: true })
	ok: boolean;
}

@Resolver()
export class PostResolver {
	@Query(() => [Post])
	listPosts(): Promise<Post[]> {
		return Post.find();
	}

	@Mutation(() => CreatePostResponse)
	async createPost(
		@Arg("options", () => CreatePostInput) options: CreatePostInput,
		@Ctx() { req }: ReqRes
	): Promise<CreatePostResponse> {
		// Check if the user is logged in
		let { ok, user } = await checkLoginStatus(req);
		if (!ok) {
			// user is not logged in
			return {
				errors: [
					{
						error: "user is not logged in",
						message: "you need to be logged in to create a post",
					},
				],
			};
		}

		let { title, content, subreddit } = options;
		const post: Post = await Post.create({
			author: user.username,
			subreddit,
			title,
			content,
		}).save();
		return { post };
	}

	@Mutation(() => MutatePostResponse)
	async deletePost(
		@Arg("id", () => Int) id: number,
		@Ctx() { req }: ReqRes
	): Promise<MutatePostResponse> {
		let { ok, user } = await checkLoginStatus(req);
		if (!ok) {
			return {
				errors: [
					{
						error: "you need to be logged in",
						message:
							"you need to be logged in as the owner of the message to delete it",
					},
				],
				ok: false,
			};
		}
		try {
			let post: Post = await Post.findOneOrFail({ where: { id } });
			if (post.author !== user.username) {
				return {
					errors: [
						{
							error: "you are not the author of the message",
							message:
								"you need to be logged in as the author of the message to delete it",
						},
					],
					ok: false,
				};
			} else {
				await Post.delete({ id });
				return { ok: true };
			}
		} catch {
			return {
				errors: [
					{
						error: "that message does not exist",
						message: "cannot find a message with that id",
					},
				],
				ok: false,
			};
		}
	}

	@Mutation(() => MutatePostResponse)
	async updatePost(
		@Arg("options", () => UpdatePostInput) options: UpdatePostInput,
		@Ctx() { req }: ReqRes
	) {
		let { ok, user } = await checkLoginStatus(req);
		if (!ok) {
			return {
				errors: [
					{
						error: "you need to be logged in",
						message:
							"you need to be logged in as the owner of the message to delete it",
					},
				],
				ok: false,
			};
		}
		try {
			let { id, title, content } = options;
			let post: Post = await Post.findOneOrFail({ where: { id } });
			if (post.author !== user.username) {
				return {
					errors: [
						{
							error: "you are not the author of the message",
							message:
								"you need to be logged in as the author of the message to delete it",
						},
					],
					ok: false,
				};
			} else {
				await Post.update({ id }, { title, content });
				return { ok: true };
			}
		} catch {
			return {
				errors: [
					{
						error: "that message does not exist",
						message: "cannot find a message with that id",
					},
				],
				ok: false,
			};
		}
	}
}
