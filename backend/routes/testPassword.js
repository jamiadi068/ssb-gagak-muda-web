const bcrypt = require("bcrypt");

const password = "123456";

const hash =
  "$2b$10$CE10TWoBq00s3bJMNLMa2eO.Cfeem5rCcqmMT6XJe23nrHeOipRwS";

bcrypt.compare(password, hash).then((result) => {
  console.log("Password cocok:", result);
});