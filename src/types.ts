import { Field, ObjectType } from "type-graphql";
import { Request, Response } from "express";

@ObjectType()
export class FieldError {
	@Field()
	error: string;
	@Field()
	message: string;
}

export type ReqRes = {
	req: Request;
	res: Response;
};
