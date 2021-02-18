import { Query, Mutation, ObjectType, Resolver } from "type-graphql";

@Resolver()
export class SubredditResolver {
    @Query(() => String)
    hello3() {
        return "hi3!";
    }
}
