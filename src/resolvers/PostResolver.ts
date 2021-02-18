import { Query, Mutation, ObjectType, Resolver } from "type-graphql";

@Resolver()
export class PostResolver {
    @Query(() => String)
    hello2() {
        return "hi2!";
    }
}
