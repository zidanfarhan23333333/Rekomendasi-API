"use strict";
const router = require("express").Router();
const { authenticate, requireRole } = require("../middleware/auth.middleware");
const ctrl = require("../controllers/usercontroller");

router.use(authenticate, requireRole("user", "admin"));

router.get("/me", ctrl.getProfile);
router.get("/stats", ctrl.getStats);
router.get("/bookings", ctrl.getBookings);
router.post("/booking", ctrl.createBooking);
router.get("/pelatih", ctrl.listPelatih);
router.get("/pelatih/:id", ctrl.getPelatihById);

module.exports = router;
