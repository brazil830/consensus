import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { capsulesTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { ListCapsulesResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/capsules", async (_req, res): Promise<void> => {
  const capsules = await db.select().from(capsulesTable).orderBy(desc(capsulesTable.blockIndex)).limit(200);
  res.json(
    ListCapsulesResponse.parse(
      capsules.map((c) => ({
        ...c,
        verified: c.verified ?? true,
        createdAt: c.createdAt.toISOString(),
      }))
    )
  );
});

export default router;
