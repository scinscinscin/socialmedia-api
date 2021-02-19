import "reflect-metadata";
import { createConnection, getConnectionOptions } from "typeorm";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./resolvers/UserResolver";
import { PostResolver } from "./resolvers/PostResolver";
//import { SubredditResolver } from "./resolvers/SubredditResolver";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
(async () => {
	const app = express();
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(bodyParser.json());
	app.use(cookieParser());

	const options = await getConnectionOptions(
		process.env.NODE_ENV || "development"
	);
	await createConnection({ ...options, name: "default" });

	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [UserResolver, PostResolver],
			validate: true,
		}),
		context: ({ req, res }) => ({ req, res }),
	});

	apolloServer.applyMiddleware({ app, cors: false });
	const port = process.env.PORT || 4000;
	app.listen(port, () => {
		console.log(`server started at http://localhost:${port}/graphql`);
	});
})();
