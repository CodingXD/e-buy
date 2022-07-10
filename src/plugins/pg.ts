import fastifyPostgres, { PostgresPluginOptions } from "@fastify/postgres";
import fp from "fastify-plugin";

/**
 * This plugins adds some utilities to handle postgres
 *
 * @see https://github.com/fastify/fastify-postgres
 */
export default fp<PostgresPluginOptions>(async (fastify, opts) => {
  fastify.register(fastifyPostgres, {
    connectionString: process.env.CONNECTION_STRING,
  });
});
