import express from "express";
import cors from "cors";
import routes from "./routes.js";
import { requestLoggingMiddleware } from "./shared/observability/request-logging.middleware.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(requestLoggingMiddleware);

app.use("/api", routes);

app.get("/", (_req, res) => {
  res.send("BFF is running");
});

export default app;
