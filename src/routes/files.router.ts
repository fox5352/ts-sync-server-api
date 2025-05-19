import { Router } from "express";
import { GET, POST } from "../controllers/files.controller";


export const filesRouter = Router();

filesRouter
  .get("/api/:filetype", GET)

filesRouter
  .post("/api/:filetype", POST)
