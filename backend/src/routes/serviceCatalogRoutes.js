const express = require("express");
const router = express.Router();
const {
  getServiceCatalog,
  getCatalogServiceById,
} = require("../controllers/serviceCatalogController");

router.get("/", getServiceCatalog);
router.get("/:id", getCatalogServiceById);

module.exports = router;
