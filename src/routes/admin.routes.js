"use strict";
const router = require("express").Router();
const { authenticate, requireRole } = require("../middleware/auth.middleware");
const ctrl = require("../controllers/admincontroller");

router.use(authenticate, requireRole("ADMIN"));

router.get("/users", ctrl.getAllUsers);
router.patch("/verify/:id", ctrl.verifyPelatih);

module.exports = router;
