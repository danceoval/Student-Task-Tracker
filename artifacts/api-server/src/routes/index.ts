import { Router, type IRouter } from "express";
import healthRouter from "./health";
import coursesRouter from "./courses";
import tasksRouter from "./tasks";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(coursesRouter);
router.use(tasksRouter);
router.use(dashboardRouter);

export default router;
