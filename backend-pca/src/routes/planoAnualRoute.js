const router = require("express").Router();
const ctrl = require("../controllers/planoAnualController");
const authAdmin = require("../middleware/authAdmin");

router.get("/:ano", authAdmin, ctrl.getByAno);

module.exports = router;
