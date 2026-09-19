const bcrypt = require("bcrypt");

bcrypt.hash("$2b$10$VP7x9q3YNR6FcEjDWcEW/O5dExD2ptCMLY0NSSLxSdWf58mexjIcq", 10).then(hash => {
  console.log(hash);
});