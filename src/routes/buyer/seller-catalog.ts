import { FastifyPluginAsync } from "fastify";
import SQL from "sql-template-strings";

const listSellers: FastifyPluginAsync = async (
  fastify,
  opts
): Promise<void> => {
  fastify.get(
    "/seller-catalog/:seller_id",
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
            items: {
              type: "object",
              properties: {
                id: { type: "integer" },
                name: { type: "string" },
                price: { type: "number" },
                remaining: { type: "number" },
              },
            },
          },
        },
      },
      onRequest: [fastify.authenticate],
    },
    async function (request, reply) {
      const { seller_id } = request.params as {
        seller_id: string;
      };
      const { limit, offset } = request.query as {
        limit: number;
        offset: number;
      };

      try {
        const client = await fastify.pg.connect();
        const { rows, rowCount } = await client.query(
          SQL`SELECT id, name, price, remaining FROM products WHERE user_id = ${seller_id} LIMIT ${limit} OFFSET ${offset}`
        );

        const products = [];
        for (let i = 0; i < rowCount; i++) {
          products.push({
            id: rows[i].id,
            name: rows[i].name,
            price: rows[i].price,
            remaining: rows[i].remaining,
          });
        }

        return products;
      } catch (error: any) {
        return fastify.httpErrors.internalServerError(error);
      }
    }
  );
};

export default listSellers;
