import { FastifyPluginAsync } from "fastify";
import { SQL } from "sql-template-strings";

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
        const client = await fastify.pg.connect();
        const { rows, rowCount } = await client.query(
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

        const token = fastify.jwt.sign(
          { user: username },
          {
            expiresIn: "120s",
          }
        );
        return token;
      } catch (error: any) {
        return fastify.httpErrors.internalServerError(error);
      }
    }
  );
};

export default login;
