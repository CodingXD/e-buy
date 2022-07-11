import { FastifyPluginAsync } from "fastify";
import SQL from "sql-template-strings";

const createCatalog: FastifyPluginAsync = async (
  fastify,
  opts
): Promise<void> => {
  fastify.post(
    "/create-catalog/:seller_id",
    {
      schema: {
        body: {
          type: "array",
          minItems: 1,
          items: {
            type: "object",
            properties: {
              name: { type: "string", minLength: 3 },
              quantity: { type: "integer", minimum: 1 },
            },
            required: ["name", "quantity"],
          },
        },
        params: {
          type: "object",
          properties: {
            seller_id: { type: "number", minimum: 1 },
          },
          required: ["seller_id"],
        },
        response: {
          200: { type: "null" },
        },
      },
    },
    async function (request, reply) {
      const { seller_id } = request.params as {
        seller_id: number;
      };
      const { body } = request as {
        body: {
          name: string;
          quantity: number;
        }[];
      };

      try {
        const client = await fastify.pg.connect();
        const query = SQL`INSERT INTO products(name, quantity, user_id) VALUES`;
        for (let i = 0; i < body.length; i++) {
          if (i === 0) {
            query.append(
              SQL`(${body[i].name}, ${body[i].quantity}, ${seller_id})`
            );
            continue;
          }

          query.append(
            SQL`, (${body[i].name}, ${body[i].quantity}, ${seller_id})`
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

export default createCatalog;
