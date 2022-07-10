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

        return null;
      } catch (error: any) {
        return fastify.httpErrors.internalServerError(error);
      }
    }
  );
};

export default login;
