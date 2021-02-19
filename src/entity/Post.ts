import { ObjectType, Field, Int } from "type-graphql";
import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	ManyToOne,
	BaseEntity,
} from "typeorm";
import { User } from "./User";

@ObjectType()
@Entity()
export class Post extends BaseEntity {
	@Field(() => Int)
	@PrimaryGeneratedColumn()
	id: number;

	@Field(() => String)
	@CreateDateColumn()
	createdAt: Date;

	@Field({ nullable: true })
	@Column()
	author?: string;

	@Field({ nullable: true })
	@Column({ nullable: true })
	subreddit?: string;

	@Field(() => Int, { nullable: true })
	@Column("int", { default: 0 })
	upvotes?: number;

	@Field({ nullable: true })
	@Column()
	title?: string;

	@Field({ nullable: true })
	@Column()
	content?: string;

	@Field(() => [User], { nullable: true })
	@ManyToOne(() => User, (user) => user.upvotedPosts)
	upvoters?: User[];
}
