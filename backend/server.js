require("dotenv").config();  // MUST BE FIRST

const express = require("express");
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const notFound = require("./middleware/notFound");
const routes = require("./routes");

const app = express();

app.use(express.json());
app.use(logger);

app.use("/", routes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
