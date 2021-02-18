import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	OneToMany,
	BaseEntity,
} from "typeorm";
import { ObjectType, Field } from "type-graphql";
import { Post } from "./Post";
import { Subreddit } from "./Subreddit";

@ObjectType()
@Entity()
export class User extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Field(() => String)
	@CreateDateColumn()
	createdAt: Date;

	@Field({ nullable: true })
	@Column({ unique: true })
	username?: string;

	@Field({ nullable: true })
	@Column({ unique: true })
	uuid?: string;

	@Column()
	salt?: string;

	@Column()
	password?: string;

	@Field(() => [Post], { nullable: true })
	@OneToMany(() => Post, (post) => post.author)
	posts?: Post[];

	@Field(() => [Subreddit], { nullable: true })
	@OneToMany(() => Subreddit, (subreddit) => subreddit.subscribers)
	subscribedSubreddits?: Subreddit[];

	@Field(() => [Post], { nullable: true })
	@OneToMany(() => Post, (post) => post.upvoters)
	upvotedPosts?: Post[];

	@Column("boolean", { default: false })
	deleted?: Boolean;
}
