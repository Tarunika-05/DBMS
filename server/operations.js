import pool from "./db.js";

// 🟢 Get all drones
export async function getDrones() {
  const result = await pool.query("SELECT * FROM drone ORDER BY droneid ASC");
  return result.rows;
}

// 🟡 Add a new drone
export async function addDrone(
  model,
  maxloadkg,
  batterycapacity,
  status,
  battery
) {
  const query = `
    INSERT INTO drone (model, maxloadkg, batterycapacity, status, battery)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const values = [model, maxloadkg, batterycapacity, status, battery];
  const result = await pool.query(query, values);
  return result.rows[0];
}

// 🔵 Update drone status
export async function updateDroneStatus(droneid, status, battery) {
  const query = `
    UPDATE drone
    SET status = $1, battery = $2
    WHERE droneid = $3
    RETURNING *;
  `;
  const values = [status, battery, droneid];
  const result = await pool.query(query, values);
  return result.rows[0];
}

// 🔴 Delete a drone
export async function deleteDrone(droneid) {
  await pool.query("DELETE FROM drone WHERE droneid = $1", [droneid]);
  return { message: `Drone ${droneid} deleted successfully` };
}

// ✅ Get all operators - FIXED to return snake_case
export async function getOperators() {
  const result = await pool.query(`
    SELECT 
      operatorid AS id,
      firstname,
      lastname,
      firstname || ' ' || lastname AS fullname,
      certificationid,
      contactnumber
    FROM public.operator
    ORDER BY operatorid
  `);
  return result.rows.map((row) => ({
    id: row.id,
    firstname: row.firstname,
    lastname: row.lastname,
    fullname: row.fullname,
    certificationid: row.certificationid,
    contactnumber: row.contactnumber,
  }));
}

// Add a new operator
export async function addOperator(
  firstname,
  lastname,
  certificationid,
  contactnumber
) {
  const result = await pool.query(
    `INSERT INTO public.operator (firstname, lastname, certificationid, contactnumber)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [firstname, lastname, certificationid, contactnumber]
  );
  return result.rows[0];
}

// Update any operator fields dynamically
export async function updateOperatorDetails(
  id,
  firstname,
  lastname,
  certificationid,
  contactnumber
) {
  const updates = [];
  const values = [];
  let index = 1;

  if (firstname) {
    updates.push(`firstname = $${index++}`);
    values.push(firstname);
  }
  if (lastname) {
    updates.push(`lastname = $${index++}`);
    values.push(lastname);
  }
  if (certificationid) {
    updates.push(`certificationid = $${index++}`);
    values.push(certificationid);
  }
  if (contactnumber) {
    updates.push(`contactnumber = $${index++}`);
    values.push(contactnumber);
  }

  if (updates.length === 0) return null;

  values.push(id);
  const query = `
    UPDATE public.operator
    SET ${updates.join(", ")}
    WHERE operatorid = $${index}
    RETURNING *;
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
}

// Delete operator
export async function deleteOperator(id) {
  const result = await pool.query(
    `DELETE FROM public.operator WHERE operatorid=$1 RETURNING *`,
    [id]
  );
  return result.rows[0];
}

// GET all packages
export async function getPackages() {
  const result = await pool.query(`
    SELECT 
      p.packageid,
      p.prioritylevel,
      p.length,
      p.width,
      p.height,
      p.weightkg,
      sa.street AS sender_street,
      sa.city AS sender_city,
      sa.zip AS sender_zip,
      ra.street AS receiver_street,
      ra.city AS receiver_city,
      ra.zip AS receiver_zip
    FROM public.package p
    LEFT JOIN public.address sa ON p.senderaddressid = sa.addressid
    LEFT JOIN public.address ra ON p.receiveraddressid = ra.addressid
    ORDER BY p.packageid;
  `);

  const packages = result.rows.map((row) => ({
    id: `PKG-${row.packageid.toString().padStart(3, "0")}`,
    priority: row.prioritylevel,
    dimensions: `${row.length}x${row.width}x${row.height} cm`,
    weight: `${row.weightkg} kg`,
    sender: `${row.sender_street}, ${row.sender_city} ${row.sender_zip}`,
    receiver: `${row.receiver_street}, ${row.receiver_city} ${row.receiver_zip}`,
    deliveryId: `DEL-2024-XXX`,
    status: "Pending",
  }));

  return packages;
}

// ADD a package
export async function addPackage(pkg) {
  const {
    priority,
    length,
    width,
    height,
    weight,
    senderAddressId,
    receiverAddressId,
  } = pkg;

  const numericWeight =
    typeof weight === "string" ? parseFloat(weight) : weight;

  const result = await pool.query(
    `INSERT INTO public.package 
      (prioritylevel, length, width, height, weightkg, senderaddressid, receiveraddressid)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING *`,
    [
      priority,
      length,
      width,
      height,
      numericWeight,
      senderAddressId,
      receiverAddressId,
    ]
  );

  const row = result.rows[0];

  return {
    id: `PKG-${row.packageid.toString().padStart(3, "0")}`,
    priority: row.prioritylevel,
    dimensions: `${row.length}x${row.width}x${row.height} cm`,
    weight: `${row.weightkg} kg`,
    sender: `Address #${row.senderaddressid}`,
    receiver: `Address #${row.receiveraddressid}`,
    deliveryId: `DEL-2024-XXX`,
    status: "Pending",
  };
}

// UPDATE package status
export async function updatePackage(id, updates) {
  const numericId = parseInt(id.replace("PKG-", ""), 10);

  // updates = { prioritylevel, length, width, height, weightkg, senderaddressid, receiveraddressid }
  const {
    prioritylevel,
    length,
    width,
    height,
    weightkg,
    senderaddressid,
    receiveraddressid,
  } = updates;

  const result = await pool.query(
    `UPDATE public.package
     SET prioritylevel = COALESCE($2, prioritylevel),
         length = COALESCE($3, length),
         width = COALESCE($4, width),
         height = COALESCE($5, height),
         weightkg = COALESCE($6, weightkg),
         senderaddressid = COALESCE($7, senderaddressid),
         receiveraddressid = COALESCE($8, receiveraddressid)
     WHERE packageid = $1
     RETURNING *`,
    [
      numericId,
      prioritylevel,
      length,
      width,
      height,
      weightkg,
      senderaddressid,
      receiveraddressid,
    ]
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];

  return {
    id: `PKG-${row.packageid.toString().padStart(3, "0")}`,
    priority: row.prioritylevel,
    dimensions: `${row.length}x${row.width}x${row.height} cm`,
    weight: `${row.weightkg} kg`,
    sender: `Address #${row.senderaddressid}`,
    receiver: `Address #${row.receiveraddressid}`,
    deliveryId: "DEL-2024-XXX",
  };
}

// DELETE a package
export async function deletePackage(id) {
  const numericId = parseInt(id.replace("PKG-", ""), 10);

  const result = await pool.query(
    `DELETE FROM public.package WHERE packageid=$1 RETURNING *`,
    [numericId]
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];

  return {
    id: `PKG-${row.packageid.toString().padStart(3, "0")}`,
    priority: row.prioritylevel,
    dimensions: `${row.length}x${row.width}x${row.height} cm`,
    weight: `${row.weightkg} kg`,
    sender: `Address #${row.senderaddressid}`,
    receiver: `Address #${row.receiveraddressid}`,
    deliveryId: `DEL-2024-XXX`,
    status: "Deleted",
  };
}

// ✅ Get all deliveries - RETURN RAW SNAKE_CASE FROM DB
export async function getDeliveries() {
  const query = `
    SELECT 
        d.deliveryid,
        d.droneid,
        d.operatorid,
        d.starttime,
        d.endtime,
        d.deliverystatus
    FROM delivery d
    ORDER BY d.deliveryid DESC;
  `;

  try {
    const result = await pool.query(query);

    // ✅ Return EXACTLY as it comes from DB (snake_case)
    return result.rows.map((row) => ({
      deliveryid: row.deliveryid,
      droneid: row.droneid,
      operatorid: row.operatorid,
      starttime: row.starttime,
      endtime: row.endtime,
      deliverystatus: row.deliverystatus,
    }));
  } catch (err) {
    console.error("Error in getDeliveries:", err);
    throw err;
  }
}

// ✅ Add a new delivery - FIXED
export async function addDelivery(delivery) {
  const { droneid, operatorid, starttime, endtime, deliverystatus } = delivery;

  if (!droneid || !operatorid || !starttime) {
    throw new Error("droneid, operatorid, and starttime are required");
  }

  try {
    const result = await pool.query(
      `INSERT INTO delivery (droneid, operatorid, starttime, endtime, deliverystatus)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [droneid, operatorid, starttime, endtime || null, deliverystatus]
    );

    const row = result.rows[0];

    // ✅ Return snake_case to match frontend
    return {
      deliveryid: row.deliveryid,
      droneid: row.droneid,
      operatorid: row.operatorid,
      starttime: row.starttime,
      endtime: row.endtime,
      deliverystatus: row.deliverystatus,
    };
  } catch (err) {
    console.error("Error in addDelivery:", err);
    throw err;
  }
}

// ✅ Update delivery status - FIXED (was missing!)
export async function updateDeliveryStatus(id, deliverystatus) {
  try {
    const result = await pool.query(
      `UPDATE delivery SET deliverystatus = $1 WHERE deliveryid = $2 RETURNING *`,
      [deliverystatus, id]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      deliveryid: row.deliveryid,
      droneid: row.droneid,
      operatorid: row.operatorid,
      starttime: row.starttime,
      endtime: row.endtime,
      deliverystatus: row.deliverystatus,
    };
  } catch (err) {
    console.error("Error in updateDeliveryStatus:", err);
    throw err;
  }
}

// ✅ Delete delivery - FIXED
export async function deleteDelivery(id) {
  const numericId =
    typeof id === "string"
      ? parseInt(id.replace("DEL-2024-", ""), 10) || parseInt(id, 10)
      : id;

  try {
    await pool.query(`DELETE FROM delivery_package WHERE deliveryid=$1`, [
      numericId,
    ]);
    await pool.query(`DELETE FROM delivery WHERE deliveryid=$1`, [numericId]);
    return { message: `Delivery deleted successfully` };
  } catch (err) {
    console.error("Error in deleteDelivery:", err);
    throw err;
  }
}

export async function getAddresses() {
  try {
    const result = await pool.query(
      "SELECT * FROM address ORDER BY addressid;"
    );
    return result.rows.map((row) => ({
      id: row.addressid,
      street: row.street,
      city: row.city,
      zip: row.zip,
    }));
  } catch (err) {
    console.error("Error in getAddresses:", err);
    throw err;
  }
}
