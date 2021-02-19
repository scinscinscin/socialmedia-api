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

@ObjectType()
class CreatePostResponse {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[];

	@Field(() => Post, { nullable: true })
	post?: Post;
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
}
