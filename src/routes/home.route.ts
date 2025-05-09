import { Router } from 'express';
import { GET, POST } from '../controllers/home.controller';

export const homeRouter = Router();

homeRouter.get('/', GET);

homeRouter.post('/', POST);
