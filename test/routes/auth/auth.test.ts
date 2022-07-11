import { test } from "tap";
import { build } from "../../helper";

test("Checking login route", async (t) => {
  const app = await build(t);

  let res = await app.inject({
    url: "/api/auth/login",
    method: "POST",
    payload: {
      username: "abbu",
      password: "pass111",
    },
  });

  t.not(res.payload, "");

  res = await app.inject({
    url: "/api/auth/register",
    method: "POST",
    payload: {
      username: "abbu_buyer",
      password: "pass111",
      type: "buyer",
    },
  });

  t.not(res.payload, "");
});
