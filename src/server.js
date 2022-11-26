import dotenv from "dotenv";
dotenv.config();

import { app } from "./app.js";

const port = process.env.PORT || 8001;
app.listen(port, () => {
  console.log("listening on " + port);
});
