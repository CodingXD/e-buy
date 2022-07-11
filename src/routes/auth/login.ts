import { FastifyPluginAsync } from "fastify";
import { SQL } from "sql-template-strings";
import { hash, genSaltSync } from "bcrypt";

const login: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.post(
    "/login",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            username: { type: "string" },
            password: { type: "string" },
          },
          required: ["username", "password"],
        },
        response: {
          200: {
            type: "string",
          },
        },
      },
    },
    async function (request, reply) {
      const { username, password } = request.body as {
        username: string;
        password: string;
      };

      try {
        await fastify.pg.connect();
        const { rows, rowCount } = await fastify.pg.query(
          SQL`SELECT password FROM users WHERE username = ${username}`
        );

        if (rowCount === 0) {
          return fastify.httpErrors.badRequest("Invalid username");
        }

        const isCorrectPassword = await fastify.verifyPassword(
          password,
          rows[0].password
        );

        if (!isCorrectPassword) {
          return fastify.httpErrors.badRequest("Password is incorrect");
        }

        const token = fastify.jwt.sign({ user: username });
        return token;
      } catch (error: any) {
        return fastify.httpErrors.internalServerError(error);
      }
    }
  );
};

export default login;
