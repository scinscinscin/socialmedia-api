import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class FieldError {
	@Field()
	error: string;
	@Field()
	message: string;
}
