import { Router } from "express";
import { GET, POST } from "../controllers/settings.controller";


export const settingsRouter = Router();

settingsRouter.get("/api/settings", GET)

settingsRouter.post("/api/settings", POST)
