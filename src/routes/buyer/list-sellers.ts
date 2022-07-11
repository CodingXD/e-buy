import { FastifyPluginAsync } from "fastify";
import SQL from "sql-template-strings";

const listSellers: FastifyPluginAsync = async (
  fastify,
  opts
): Promise<void> => {
  fastify.get(
    "/list-of-sellers",
    {
      schema: {
        headers: {
          type: "object",
          properties: {
            authorization: { type: "string", minLength: 8 },
          },
          required: ["authorization"],
        },
        querystring: {
          type: "object",
          properties: {
            limit: { type: "integer", minimum: 1 },
            offset: { type: "integer" },
          },
          required: ["limit"],
        },
        response: {
          200: {
            type: "array",
            items: { type: "string" },
          },
        },
      },
      onRequest: [fastify.authenticate],
    },
    async function (request, reply) {
      const { limit, offset } = request.query as {
        limit: number;
        offset: number;
      };

      try {
        const client = await fastify.pg.connect();
        const { rows, rowCount } = await client.query(
          SQL`SELECT username FROM users WHERE type = 'seller' LIMIT ${limit} OFFSET ${offset}`
        );

        const sellers = [];
        for (let i = 0; i < rowCount; i++) {
          sellers.push(rows[i]);
        }

        return sellers;
      } catch (error: any) {
        return fastify.httpErrors.internalServerError(error);
      }
    }
  );
};

export default listSellers;
