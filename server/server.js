// server.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {
  getDrones,
  addDrone,
  updateDroneStatus,
  deleteDrone,
  getOperators,
  addOperator,
  updateOperatorDetails,
  deleteOperator,
  getPackages,
  addPackage,
  updatePackage,
  deletePackage,
  getDeliveries,
  addDelivery,
  updateDeliveryStatus,
  deleteDelivery,
} from "./operations.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
// Simple test route for "/"
app.get("/", (req, res) => {
  res.send("🚀 Drone API is running!");
});

// ✅ GET /drones → get all drones
app.get("/drones", async (req, res) => {
  try {
    const drones = await getDrones();
    res.json(drones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ POST /drones → add a new drone
app.post("/drones", async (req, res) => {
  try {
    console.log("Incoming drone data:", req.body);

    const { model, maxloadkg, batterycapacity, status, battery } = req.body;

    if (
      !model ||
      !maxloadkg ||
      !batterycapacity ||
      !status ||
      battery === undefined
    ) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const newDrone = await addDrone(
      model,
      maxloadkg,
      batterycapacity,
      status,
      battery
    );
    console.log("New drone added:", newDrone);
    res.status(201).json(newDrone);
  } catch (err) {
    console.error("Error adding drone:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ PUT /drones/:id → update status
app.put("/drones/:id", async (req, res) => {
  try {
    const { status, battery } = req.body;
    const { id } = req.params;

    const updatedDrone = await updateDroneStatus(id, status, battery);
    if (!updatedDrone)
      return res.status(404).json({ error: "Drone not found." });

    res.json(updatedDrone);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ DELETE /drones/:id → delete drone
app.delete("/drones/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteDrone(id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /operators → get all operators
app.get("/operators", async (req, res) => {
  try {
    const operators = await getOperators();
    res.json(operators);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /operators → add a new operator
app.post("/operators", async (req, res) => {
  try {
    const { firstname, lastname, certificationid, contactnumber } = req.body;
    if (!firstname || !lastname || !certificationid || !contactnumber) {
      return res.status(400).json({ error: "All fields are required." });
    }
    const newOperator = await addOperator(
      firstname,
      lastname,
      certificationid,
      contactnumber
    );
    res.status(201).json(newOperator);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /operators/:id → update contact number and certification ID
app.put("/operators/:id", async (req, res) => {
  try {
    const { firstname, lastname, certificationid, contactnumber } = req.body;
    const { id } = req.params;

    const updated = await updateOperatorDetails(
      id,
      firstname,
      lastname,
      certificationid,
      contactnumber
    );

    if (!updated)
      return res
        .status(404)
        .json({ error: "Operator not found or no fields provided" });

    res.json(updated);
  } catch (err) {
    console.error("Error updating operator:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /operators/:id → delete operator
app.delete("/operators/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteOperator(id);
    res.json(deleted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /packages
app.get("/packages", async (req, res) => {
  try {
    const packages = await getPackages();
    res.json(packages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /packages
// ✅ POST /packages → add a new package
app.post("/packages", async (req, res) => {
  try {
    const { priority, dimensions, weight, senderAddressId, receiverAddressId } =
      req.body;

    if (
      !priority ||
      !dimensions ||
      !weight ||
      !senderAddressId ||
      !receiverAddressId
    ) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const match = dimensions.match(
      /(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)/
    );
    if (!match) {
      return res
        .status(400)
        .json({ error: "Dimensions must be in format LxWxH" });
    }

    const [_, length, width, height] = match.map(Number);

    const newPackage = await addPackage({
      priority,
      length,
      width,
      height,
      weight,
      senderAddressId,
      receiverAddressId,
    });

    res.status(201).json(newPackage);
  } catch (err) {
    console.error("❌ Error adding package:", err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /packages/:id
app.put("/packages/:id", async (req, res) => {
  try {
    const {
      prioritylevel,
      length,
      width,
      height,
      weightkg,
      senderaddressid,
      receiveraddressid,
    } = req.body;
    const { id } = req.params;

    const updatedPkg = await updatePackage(id, {
      prioritylevel,
      length,
      width,
      height,
      weightkg,
      senderaddressid,
      receiveraddressid,
    });

    if (!updatedPkg)
      return res.status(404).json({ error: "Package not found" });

    res.json(updatedPkg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /packages/:id
app.delete("/packages/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPkg = await deletePackage(id);
    if (!deletedPkg)
      return res.status(404).json({ error: "Package not found" });
    res.json(deletedPkg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ✅ GET /deliveries (optional status filter)
app.get("/deliveries", async (req, res) => {
  try {
    const { status } = req.query;
    const deliveries = await getDeliveries(status);
    res.json(deliveries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ POST /deliveries → add new delivery
app.post("/deliveries", async (req, res) => {
  try {
    const newDelivery = await addDelivery(req.body);

    // Send back the newly created delivery as confirmation
    res.status(201).json(newDelivery);
  } catch (err) {
    console.error("❌ Error adding delivery:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ PUT /deliveries/:id → update status
app.put("/deliveries/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await updateDeliveryStatus(req.params.id, status);
    if (!updated) return res.status(404).json({ error: "Delivery not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ DELETE /deliveries/:id → delete delivery
app.delete("/deliveries/:id", async (req, res) => {
  try {
    const result = await deleteDelivery(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

import { getAddresses } from "./operations.js"; // import the new function

app.get("/addresses", async (req, res) => {
  try {
    const addresses = await getAddresses();
    res.json(addresses);
  } catch (err) {
    console.error("Error fetching addresses:", err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
