import fastifyCors, { FastifyCorsOptions } from "@fastify/cors";
import fp from "fastify-plugin";

/**
 * This plugins adds some utilities to handle cors
 *
 * @see https://github.com/fastify/fastify-cors
 */
export default fp<FastifyCorsOptions>(async (fastify, opts) => {
  fastify.register(fastifyCors, {
    origin: process.env.ORIGIN,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  });
});
