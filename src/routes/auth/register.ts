import { FastifyPluginAsync } from "fastify";
import { SQL } from "sql-template-strings";

const register: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.post(
    "/register",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            username: { type: "string" },
            password: { type: "string" },
            type: { type: "string", enum: ["buyer", "seller"] },
          },
          required: ["username", "password", "type"],
        },
        response: {
          200: {
            type: "string",
          },
        },
      },
    },
    async function (request, reply) {
      const { username, password, type } = request.body as {
        username: string;
        password: string;
        type: string;
      };

      try {
        const client = await fastify.pg.connect();
        const { rowCount } = await client.query(
          SQL`SELECT 1 FROM users WHERE username = ${username}`
        );

        if (rowCount !== 0) {
          return fastify.httpErrors.badRequest("Username taken!");
        }

        const hashedPassword = await fastify.hashPassword(password);

        await client.query(
          SQL`INSERT INTO users(username, password, type) VALUES(${username}, ${hashedPassword}, ${type})`
        );

        const token = fastify.jwt.sign({ user: username });
        return token;
      } catch (error: any) {
        return fastify.httpErrors.internalServerError(error);
      }
    }
  );
};

export default register;
