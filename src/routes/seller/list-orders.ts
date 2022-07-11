import { FastifyPluginAsync } from "fastify";
import SQL from "sql-template-strings";

const listOrders: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get(
    "/orders/:seller_id",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            seller_id: { type: "number", minimum: 1 },
          },
          required: ["seller_id"],
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
                order_id: { type: "integer" },
                item_name: { type: "string" },
                ordered_on: { type: "string" },
              },
            },
          },
        },
      },
    },
    async function (request, reply) {
      const { seller_id } = request.params as {
        seller_id: number;
      };
      const { limit, offset } = request.query as {
        limit: number;
        offset: number;
      };

      try {
        const client = await fastify.pg.connect();
        const { rows, rowCount } = await client.query(
          SQL`SELECT orders.id, name, orders.created_on FROM orders, products, users WHERE orders.user_id = users.id AND orders.product_id = products.id AND user_id = ${seller_id} LIMIT ${limit} OFFSET ${offset}`
        );

        const orders = [];
        for (let i = 0; i < rowCount; i++) {
          orders.push({
            order_id: rows[i].id,
            item_name: rows[i].name,
            ordered_on: rows[i].created_on,
          });
        }

        return orders;
      } catch (error: any) {
        return fastify.httpErrors.internalServerError(error);
      }
    }
  );
};

export default listOrders;
