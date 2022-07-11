import { test } from "tap";
import { build } from "../../helper";

test("Checking buyer routes", async (t) => {
  const app = await build(t);
  const token = app.jwt.sign({ user: "username" });

  const res = await app.inject({
    url: "/buyer/list-of-sellers?limit=10&offset=0",
    method: "GET",
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  t.not(res.payload, "");
});
