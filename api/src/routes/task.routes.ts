import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';

export const createTaskRoutes = (controller: TaskController): Router => {
  const router = Router();
  router.get('/', controller.list);
  router.post('/', controller.create);
  router.patch('/:id', controller.update);
  router.delete('/:id', controller.delete);
  return router;
};
