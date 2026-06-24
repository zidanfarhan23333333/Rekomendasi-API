const p = require("./src/config/database");
console.log(
  "Models tersedia:",
  Object.keys(p).filter((k) => !k.startsWith("_") && !k.startsWith("$")),
);
