import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.BFF_PORT || 5000,
  backendGraphqlUrl:
    process.env.BACKEND_GRAPHQL_URL || "http://localhost:4000/graphql",
};
