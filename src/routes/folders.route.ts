import { Router } from "express";
import { GET, POST } from "../controllers/folders.controller";

export const foldersRouter = Router();


foldersRouter.get('/api/folders', GET);


foldersRouter.post('/api/folders', POST);
