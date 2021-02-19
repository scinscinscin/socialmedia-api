import { User } from "../entity/User";
import { FieldError } from "../types";
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
import { ReqRes } from "../types";
import genSalt from "crypto-random-string";
import pbkdf2 from "pbkdf2";
import jsonwebtoken from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

const { jwt_secret } = require("../../constants.json");
const validateUserInput = require("../utils/validateUserInput");
const checkLoginStatus = require("../utils/checkLoginStatus");

@InputType()
class UsernamePassword {
	@Field()
	username: string;

	@Field()
	password: string;
}

@ObjectType()
class RegisterResponse {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[];

	@Field(() => User, { nullable: true })
	user?: User;
}

@ObjectType()
class LoginResponse {
	@Field(() => Boolean)
	ok: Boolean;

	@Field(() => User, { nullable: true })
	user?: User;

	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[];
}

@ObjectType()
class DeleteAccountResponse {
	@Field(() => Boolean)
	ok: Boolean;

	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[];
}

@Resolver()
export class UserResolver {
	@Query(() => [User])
	listUsers(): Promise<User[]> {
		return User.find();
	}

	@Query(() => LoginResponse)
	async checkLogin(@Ctx() { req }: ReqRes): Promise<LoginResponse> {
		let { ok, user } = await checkLoginStatus(req);
		if (!ok) {
			return { ok }; //user is not logged in
		} else {
			return { ok, user }; //user is logged in
		}
	}

	@Mutation(() => RegisterResponse)
	async register(
		@Arg("options", () => UsernamePassword) options: UsernamePassword,
		@Ctx() { res }: ReqRes
	): Promise<RegisterResponse> {
		const { username, password } = options;
		if (validateUserInput(username, password)) {
			return {
				errors: [
					{
						error: "Invalid inputs",
						message:
							"username and password may contain a space, password may also be shorter than 6 characters",
					},
				],
			};
		}
		const uuid = uuidv4();
		const salt = genSalt({ length: 64, type: "url-safe" });
		const hashedPassword = pbkdf2
			.pbkdf2Sync(password, salt, 10000, 32, "sha512")
			.toString("hex");

		try {
			const status: User = await User.create({
				username,
				uuid,
				salt,
				password: hashedPassword,
			}).save();

			let token = jsonwebtoken.sign(uuid, jwt_secret);
			res.cookie("jwt", token, {
				maxAge: 1000 * 60 * 60,
				httpOnly: true,
			});

			return {
				user: status,
			};
		} catch (err) {
			if (err.errno === 19) {
				return {
					errors: [
						{
							error: "Username is already taken",
							message: "That username has already been taken",
						},
					],
				};
			} else {
				return {
					errors: [
						{
							error: "Internal Server Error",
							message: "Unknown Error has occured",
						},
					],
				};
			}
		}
	}

	@Mutation(() => LoginResponse)
	async login(
		@Arg("options", () => UsernamePassword) options: UsernamePassword,
		@Ctx() { res }: ReqRes
	): Promise<LoginResponse> {
		try {
			let user: any = await User.findOneOrFail({
				//password here is hashed password
				where: { username: options.username },
			});
			``;
			if (user.deleted == true) {
				return {
					ok: false,
					errors: [
						{
							error: "Deleted account",
							message:
								"that account has been deleted by it's owner",
						},
					],
				};
			}

			let isValid: Boolean =
				pbkdf2
					.pbkdf2Sync(
						options.password,
						user.salt,
						10000,
						32,
						"sha512"
					)
					.toString("hex") === user.password;

			if (!isValid) {
				return {
					ok: false,
				};
			}

			// valid password
			let token = jsonwebtoken.sign(user.uuid, jwt_secret);
			res.cookie("jwt", token, {
				maxAge: 1000 * 60 * 60,
				httpOnly: true,
			});
			return { ok: true, user };
		} catch (err) {
			return { ok: false };
		}
	}

	@Mutation(() => DeleteAccountResponse)
	async deleteAccount(
		@Arg("password", () => String) password: string,
		@Ctx() { req, res }: ReqRes
	): Promise<DeleteAccountResponse> {
		try {
			let decoded: any = jsonwebtoken.verify(req.cookies.jwt, jwt_secret);
			let user: any = await User.findOne({ where: { uuid: decoded } });

			let isValid: Boolean =
				pbkdf2
					.pbkdf2Sync(password, user.salt, 10000, 32, "sha512")
					.toString("hex") === user.password;

			if (!isValid) {
				return {
					ok: false,
					errors: [
						{
							error: "Wrong password",
							message: "Correct password is needed",
						},
					],
				};
			}

			//set to true and destroy the cookie
			await User.update({ uuid: decoded }, { deleted: true });
			res.cookie("jwt", "", {
				maxAge: -1000,
				httpOnly: true,
			});
			return { ok: true };
		} catch {
			return {
				ok: false,
				errors: [
					{
						error: "Not logged in",
						message:
							"User needs to be logged in to delete their account",
					},
				],
			};
		}
	}

	@Mutation(() => Boolean)
	async logout(@Ctx() { res }: ReqRes): Promise<boolean> {
		res.cookie("jwt", "", {
			maxAge: -1000,
			httpOnly: true,
		});
		return true;
	}
}
