import { compare, genSaltSync, hash } from "bcrypt";
import fp from "fastify-plugin";

export interface SupportPluginOptions {
  // Specify Support plugin options here
}

// The use of fastify-plugin is required to be able
// to export the decorators to the outer scope
export default fp<SupportPluginOptions>(async (fastify, opts) => {
  fastify.decorate("hash-password", async function (password: string) {
    const salt = genSaltSync(10);
    const hashedPassword = await hash(password, salt);
    return hashedPassword;
  });
  fastify.decorate(
    "verify-password",
    async function (password: string, hashedPassword: string) {
      return compare(password, hashedPassword);
    }
  );
});

// When using .decorate you have to specify added properties for Typescript
declare module "fastify" {
  export interface FastifyInstance {
    hashPassword(password: string): Promise<string>;
    verifyPassword(password: string, hashedPassword: string): Promise<boolean>;
  }
}
