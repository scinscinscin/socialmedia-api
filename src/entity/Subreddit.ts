import { ObjectType, Field, Int } from "type-graphql";
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
} from "typeorm";
import { Post } from "./Post";
import { User } from "./User";

@ObjectType()
@Entity()
export class Subreddit {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field({ nullable: true })
    @Column()
    name?: string;

    @Field({ nullable: true })
    @Column()
    owner?: string;

    @Field(() => [Post], { nullable: true })
    @ManyToOne(() => Post, (post) => post.subreddit)
    posts?: Post[];

    @Field(() => [User], { nullable: true })
    @ManyToOne(() => User, (user) => user.subscribedSubreddits)
    subscribers?: User[];
}
