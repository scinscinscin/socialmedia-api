import { Request } from "express";
import jsonwebtoken from "jsonwebtoken";
import { User } from "../entity/User";

const { jwt_secret } = require("../../constants.json");
class loginStatus {
	ok: boolean;
	user?: User;
}

async function checkLoginStatus(req: Request): Promise<loginStatus> {
	try {
		let decoded: any = jsonwebtoken.verify(req.cookies.jwt, jwt_secret);
		let user = await User.findOne({ where: { uuid: decoded } });
		return { ok: true, user };
	} catch {
		console.log(req.cookies.jwt);
		return { ok: false };
	}
}

module.exports = checkLoginStatus;
