"use strict";
const router = require("express").Router();
const ctrl = require("../controllers/authcontroller");
const { authenticate } = require("../middleware/auth.middleware");

router.post("/register", ctrl.register);
router.post("/login", ctrl.login);
router.get("/me", authenticate, ctrl.getProfile);

module.exports = router;
