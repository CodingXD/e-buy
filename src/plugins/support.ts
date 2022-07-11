import { compare, genSaltSync, hash } from "bcrypt";
import { FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";

export interface SupportPluginOptions {
  // Specify Support plugin options here
}

// The use of fastify-plugin is required to be able
// to export the decorators to the outer scope
export default fp<SupportPluginOptions>(async (fastify, opts) => {
  fastify.decorate("hashPassword", async function (password: string) {
    const salt = genSaltSync(10);
    const hashedPassword = await hash(password, salt);
    return hashedPassword;
  });
  fastify.decorate(
    "verifyPassword",
    async function (password: string, hashedPassword: string) {
      return compare(password, hashedPassword);
    }
  );
  fastify.decorate(
    "authenticate",
    async function (request: FastifyRequest, reply: FastifyReply) {
      try {
        await request.jwtVerify();
      } catch (err: any) {
        reply.unauthorized(err);
      }
    }
  );
});

// When using .decorate you have to specify added properties for Typescript
declare module "fastify" {
  export interface FastifyInstance {
    hashPassword(password: string): Promise<string>;
    verifyPassword(password: string, hashedPassword: string): Promise<boolean>;
    authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void>;
  }
}
