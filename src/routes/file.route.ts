import { GET } from "../controllers/file.controller";

const { Router } = require("express");

export const fileRouter = Router();

fileRouter.get("/api/:filetype/file", GET)
