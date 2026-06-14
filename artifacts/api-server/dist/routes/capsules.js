"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("@workspace/db");
const db_2 = require("@workspace/db");
const drizzle_orm_1 = require("drizzle-orm");
const api_zod_1 = require("@workspace/api-zod");
const router = (0, express_1.Router)();
router.get("/capsules", async (_req, res) => {
    const capsules = await db_1.db.select().from(db_2.capsulesTable).orderBy((0, drizzle_orm_1.desc)(db_2.capsulesTable.blockIndex)).limit(200);
    res.json(api_zod_1.ListCapsulesResponse.parse(capsules.map((c) => ({
        ...c,
        verified: c.verified ?? true,
        createdAt: c.createdAt.toISOString(),
    }))));
});
exports.default = router;
//# sourceMappingURL=capsules.js.map