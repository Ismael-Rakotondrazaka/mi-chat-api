import { refresh } from "#controllers/index.js";

import { Router } from "express";

const tokenRoutes = Router();

tokenRoutes.post("/refresh", refresh);

export { tokenRoutes };
