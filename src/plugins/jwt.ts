import fastifyJwt, { FastifyJWTOptions } from "@fastify/jwt";
import fp from "fastify-plugin";

/**
 * This plugins adds some utilities to handle jwt tokens
 *
 * @see https://github.com/fastify/fastify-jwt
 */
export default fp<FastifyJWTOptions>(async (fastify, opts) => {
  fastify.register(fastifyJwt, {
    secret: process.env.JWT_SECRET as string,
  });
});
