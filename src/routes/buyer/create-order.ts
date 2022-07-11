import { FastifyPluginAsync } from "fastify";
import SQL from "sql-template-strings";

const createOrder: FastifyPluginAsync = async (
  fastify,
  opts
): Promise<void> => {
  fastify.post(
    "/create-order/:seller_id",
    {
      schema: {
        headers: {
          type: "object",
          properties: {
            authorization: { type: "string", minLength: 8 },
          },
          required: ["authorization"],
        },
        body: {
          type: "array",
          minItems: 1,
          items: {
            type: "object",
            properties: {
              id: { type: "integer", minimum: 1 },
              quantity: { type: "integer", minimum: 1 },
            },
            required: ["id", "quantity"],
          },
        },
        response: {
          200: {
            type: "null",
          },
          400: {
            type: "object",
            properties: {
              message: { type: "string" },
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "integer" },
                    name: { type: "string" },
                    remaining: { type: "number" },
                  },
                },
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
      const { body } = request as {
        body: { id: number; quantity: number }[];
      };

      try {
        const client = await fastify.pg.connect();

        // checking if there is enough items in stock
        const ids = [];
        for (let i = 0; i < body.length; i++) {
          ids.push(body[i].id);
        }

        const { rows, rowCount } = await client.query(
          SQL`SELECT id, name, remaining FROM products WHERE id IN (${ids})`
        );

        const notInStockItems = [];
        for (let i = 0; i < rowCount; i++) {
          for (let j = 0; j < body.length; j++) {
            if (rows[i].id === body[j].id) {
              if (rows[i].remaining < body[j].quantity) {
                notInStockItems.push({
                  id: rows[i].id,
                  name: rows[i].name,
                  remaining: rows[i].remaining,
                });
              }
              break;
            }
          }
        }

        if (notInStockItems.length > 0) {
          reply.statusCode = 400;
          return {
            message: "Not enough stock",
            items: notInStockItems,
          };
        }

        // otherwise create new order
        const query = SQL`INSERT INTO orders(product_id, seller_id, quantity) VALUES`;
        for (let i = 0; i < body.length; i++) {
          if (i === 0) {
            query.append(
              SQL`(${body[i].id}, ${seller_id}, ${body[i].quantity})`
            );
            continue;
          }

          query.append(
            SQL`, (${body[i].id}, ${seller_id}, ${body[i].quantity})`
          );
        }

        await client.query(query);
        return null;
      } catch (error: any) {
        return fastify.httpErrors.internalServerError(error);
      }
    }
  );
};

export default createOrder;
