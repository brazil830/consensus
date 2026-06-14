import { Router, type IRouter } from "express";
import healthRouter from "./health";
import tasksRouter from "./tasks";
import capsulesRouter from "./capsules";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(tasksRouter);
router.use(capsulesRouter);
router.use(dashboardRouter);

export default router;
