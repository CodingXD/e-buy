import { test } from "tap";
import Fastify from "fastify";
import Support from "../../src/plugins/support";

test("Testing Support Functions", async (t) => {
  const fastify = Fastify();
  void fastify.register(Support);
  await fastify.ready();

  t.not(await fastify.hashPassword("pass111"), "");
  t.equal(
    await fastify.verifyPassword(
      "pass111",
      await fastify.hashPassword("pass111")
    ),
    true
  );
});
