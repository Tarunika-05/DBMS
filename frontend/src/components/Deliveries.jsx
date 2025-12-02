import React, { useState, useEffect } from "react";

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState(null);
  const [drones, setDrones] = useState([]);
  const [operators, setOperators] = useState([]);

  const filterOptions = [
    "All",
    "Scheduled",
    "In-Progress",
    "Completed",
    "Failed",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [deliveriesRes, dronesRes, operatorsRes] = await Promise.all([
          fetch("http://localhost:5000/deliveries"),
          fetch("http://localhost:5000/drones"),
          fetch("http://localhost:5000/operators"),
        ]);

        if (!deliveriesRes.ok || !dronesRes.ok || !operatorsRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const [deliveriesData, dronesData, operatorsData] = await Promise.all([
          deliveriesRes.json(),
          dronesRes.json(),
          operatorsRes.json(),
        ]);

        console.log("✅ Deliveries:", deliveriesData);
        console.log("✅ Drones:", dronesData);
        console.log("✅ Operators:", operatorsData);

        setDeliveries(deliveriesData);
        setDrones(dronesData);
        setOperators(operatorsData);
        setError(null);
      } catch (err) {
        console.error("❌ Error fetching data:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const deleteDelivery = async (deliveryId) => {
    if (!window.confirm("Are you sure you want to delete this delivery?")) {
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:5000/deliveries/${deliveryId}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Failed to delete");
      setDeliveries((prev) => prev.filter((d) => d.deliveryid !== deliveryId));
      alert("✅ Delivery deleted successfully!");
    } catch (err) {
      console.error("❌ Error deleting delivery:", err);
      alert("❌ Failed to delete delivery");
    }
  };

  const addDelivery = async (deliveryData) => {
    try {
      console.log("📤 Sending to backend:", deliveryData);
      const response = await fetch("http://localhost:5000/deliveries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deliveryData),
      });

      const responseData = await response.json();
      console.log("📥 Backend response:", responseData);

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to add delivery");
      }

      setDeliveries((prev) => [...prev, responseData]);
      setShowAddModal(false);
      alert("✅ Delivery added successfully!");
    } catch (err) {
      console.error("❌ Error adding delivery:", err);
      alert("❌ Failed to add delivery: " + err.message);
    }
  };

  const editDelivery = async (deliveryData) => {
    try {
      const response = await fetch(
        `http://localhost:5000/deliveries/${deliveryData.deliveryid}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(deliveryData),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to update");
      }

      setDeliveries((prev) =>
        prev.map((d) =>
          d.deliveryid === deliveryData.deliveryid ? responseData : d
        )
      );
      setShowEditModal(false);
      setEditingDelivery(null);
      alert("✅ Delivery updated successfully!");
    } catch (err) {
      console.error("❌ Error updating delivery:", err);
      alert("❌ Failed to update delivery: " + err.message);
    }
  };

  const filteredDeliveries =
    selectedFilter === "All"
      ? deliveries
      : deliveries.filter(
          (delivery) => delivery.deliverystatus === selectedFilter
        );

  const getStatusColor = (status) => {
    switch (status) {
      case "Scheduled":
        return "🟦 bg-blue-500/20 text-blue-300 border-blue-400/30";
      case "In-Progress":
        return "🟨 bg-yellow-500/20 text-yellow-300 border-yellow-400/30";
      case "Completed":
        return "🟩 bg-emerald-500/20 text-emerald-300 border-emerald-400/30";
      case "Failed":
        return "🟥 bg-red-500/20 text-red-300 border-red-400/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-400/30";
    }
  };

  const toggleRowExpansion = (deliveryId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(deliveryId)) {
      newExpanded.delete(deliveryId);
    } else {
      newExpanded.add(deliveryId);
    }
    setExpandedRows(newExpanded);
  };

  const getDroneName = (droneId) => {
    const drone = drones.find((d) => d.droneid === droneId);
    return drone ? drone.model : `Drone #${droneId}`;
  };

  const getOperatorName = (operatorId) => {
    const operator = operators.find((o) => o.id === operatorId);
    return operator ? operator.fullname : `Operator #${operatorId}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full fixed inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400 mb-4"></div>
          <p className="text-white text-xl">Loading deliveries...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full fixed inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-blue-900 flex items-center justify-center">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
          <p className="text-white/70 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all duration-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full fixed inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-blue-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-teal-400 to-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-60 h-60 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse animation-delay-4000"></div>
      </div>

      <header className="w-full relative z-10 backdrop-blur-md bg-white/10 border-b border-white/20 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="bg-gradient-to-br from-cyan-400 via-blue-500 to-teal-600 p-4 rounded-2xl shadow-2xl ring-4 ring-white/20">
                  <span className="text-3xl filter drop-shadow-lg">📦</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full"></div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-cyan-200 to-blue-300 bg-clip-text text-transparent drop-shadow-lg">
                  Delivery Management
                </h1>
                <p className="text-white/70 text-sm mt-1">
                  Track and manage delivery operations
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-300 text-sm font-medium">
                {
                  filteredDeliveries.filter(
                    (d) => d.deliverystatus === "In-Progress"
                  ).length
                }{" "}
                Active
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full relative z-10 max-w-7xl mx-auto px-6 py-10 overflow-y-auto h-full">
        <div className="mb-8">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">
                  Delivery Overview
                </h2>
                <p className="text-white/60 text-sm">
                  {filteredDeliveries.length} of {deliveries.length} deliveries
                  shown
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <label className="text-white/70 text-sm font-medium">
                  Filter by Status:
                </label>
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="backdrop-blur-sm bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                >
                  {filterOptions.map((option) => (
                    <option
                      key={option}
                      value={option}
                      className="bg-slate-800"
                    >
                      {option}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-medium text-sm"
                >
                  + Add Delivery
                </button>
              </div>
            </div>
          </div>
        </div>

        {filteredDeliveries.length === 0 ? (
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-bold text-white mb-2">
              No Deliveries Found
            </h3>
            <p className="text-white/60">
              {selectedFilter === "All"
                ? "There are no deliveries in the system yet."
                : `No deliveries with status "${selectedFilter}".`}
            </p>
          </div>
        ) : (
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-600/20 to-blue-600/20 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">
                      Drone
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">
                      Operator
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">
                      Start
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">
                      End
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDeliveries.map((delivery) => (
                    <React.Fragment key={delivery.deliveryid}>
                      <tr className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200">
                        <td className="px-6 py-4 text-white font-medium">
                          {delivery.deliveryid}
                        </td>
                        <td className="px-6 py-4 text-white/80">
                          {getDroneName(delivery.droneid)}
                        </td>
                        <td className="px-6 py-4 text-white/80">
                          {getOperatorName(delivery.operatorid)}
                        </td>
                        <td className="px-6 py-4 text-white/80 text-sm">
                          {delivery.starttime
                            ? new Date(delivery.starttime).toLocaleString()
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 text-white/80 text-sm">
                          {delivery.endtime
                            ? new Date(delivery.endtime).toLocaleString()
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${getStatusColor(
                              delivery.deliverystatus
                            )
                              .split(" ")
                              .slice(1)
                              .join(" ")}`}
                          >
                            {
                              getStatusColor(delivery.deliverystatus).split(
                                " "
                              )[0]
                            }{" "}
                            {delivery.deliverystatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center space-x-2">
                          <button
                            onClick={() =>
                              toggleRowExpansion(delivery.deliveryid)
                            }
                            className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 text-blue-300 text-xs font-medium py-1 px-2 rounded transition-all"
                          >
                            {expandedRows.has(delivery.deliveryid) ? "▼" : "▶"}
                          </button>
                          <button
                            onClick={() => {
                              setEditingDelivery(delivery);
                              setShowEditModal(true);
                            }}
                            className="bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400/30 text-yellow-300 text-xs font-medium py-1 px-2 rounded transition-all"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => deleteDelivery(delivery.deliveryid)}
                            className="bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 text-red-300 text-xs font-medium py-1 px-2 rounded transition-all"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>

                      {expandedRows.has(delivery.deliveryid) && (
                        <tr>
                          <td colSpan="7" className="px-6 py-6 bg-white/5">
                            <div className="bg-white/10 border border-white/20 rounded-2xl p-4">
                              <p className="text-white/80 text-sm mb-2">
                                <strong>Drone:</strong>{" "}
                                {getDroneName(delivery.droneid)}
                              </p>
                              <p className="text-white/80 text-sm mb-2">
                                <strong>Operator:</strong>{" "}
                                {getOperatorName(delivery.operatorid)}
                              </p>
                              <p className="text-white/80 text-sm mb-2">
                                <strong>Start:</strong>{" "}
                                {delivery.starttime
                                  ? new Date(
                                      delivery.starttime
                                    ).toLocaleString()
                                  : "N/A"}
                              </p>
                              <p className="text-white/80 text-sm">
                                <strong>End:</strong>{" "}
                                {delivery.endtime
                                  ? new Date(delivery.endtime).toLocaleString()
                                  : "Not completed"}
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {(showAddModal || showEditModal) && (
        <DeliveryModal
          isEdit={showEditModal}
          delivery={editingDelivery}
          drones={drones}
          operators={operators}
          onClose={() => {
            setShowAddModal(false);
            setShowEditModal(false);
            setEditingDelivery(null);
          }}
          onSave={(data) => {
            if (showEditModal) {
              editDelivery(data);
            } else {
              addDelivery(data);
            }
          }}
        />
      )}
    </div>
  );
}

function DeliveryModal({
  isEdit,
  delivery,
  drones,
  operators,
  onClose,
  onSave,
}) {
  const [formData, setFormData] = useState(
    delivery
      ? {
          deliveryid: delivery.deliveryid, // Include deliveryid here to send for edit
          droneid: delivery.droneid,
          operatorid: delivery.operatorid,
          starttime: delivery.starttime,
          endtime: delivery.endtime,
          deliverystatus: delivery.deliverystatus,
        }
      : {
          droneid: "",
          operatorid: "",
          starttime: "",
          endtime: "",
          deliverystatus: "Scheduled",
        }
  );

  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.droneid) newErrors.droneid = "Please select a drone";
    if (!formData.operatorid)
      newErrors.operatorid = "Please select an operator";
    if (!formData.starttime) newErrors.starttime = "Start time is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const dataToSend = {
      deliveryid: formData.deliveryid, // Always include deliveryid when editing
      droneid: parseInt(formData.droneid),
      operatorid: parseInt(formData.operatorid),
      starttime: formData.starttime,
      endtime: formData.endtime || null,
      deliverystatus: formData.deliverystatus,
    };

    console.log("📤 Sending:", dataToSend);
    onSave(dataToSend);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-6">
          {isEdit ? "Edit Delivery" : "Add New Delivery"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-white/70 text-sm block mb-2">Drone *</label>
            <select
              value={formData.droneid}
              onChange={(e) => {
                setFormData({ ...formData, droneid: e.target.value });
                setErrors({ ...errors, droneid: "" });
              }}
              className={`w-full bg-white/10 border ${
                errors.droneid ? "border-red-400" : "border-white/20"
              } text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/50`}
              required
            >
              <option value="" className="bg-slate-800">
                Select a drone
              </option>
              {drones.map((drone) => (
                <option
                  key={drone.droneid}
                  value={drone.droneid}
                  className="bg-slate-800"
                >
                  {drone.model} - {drone.serialnumber}
                </option>
              ))}
            </select>
            {errors.droneid && (
              <p className="text-red-400 text-xs mt-1">{errors.droneid}</p>
            )}
          </div>

          <div>
            <label className="text-white/70 text-sm block mb-2">
              Operator *
            </label>
            <select
              value={formData.operatorid}
              onChange={(e) => {
                setFormData({ ...formData, operatorid: e.target.value });
                setErrors({ ...errors, operatorid: "" });
              }}
              className={`w-full bg-white/10 border ${
                errors.operatorid ? "border-red-400" : "border-white/20"
              } text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/50`}
              required
            >
              <option value="" className="bg-slate-800">
                Select an operator
              </option>
              {operators.map((operator) => (
                <option
                  key={operator.id}
                  value={operator.id}
                  className="bg-slate-800"
                >
                  {operator.fullname} - {operator.certificationid}
                </option>
              ))}
            </select>
            {errors.operatorid && (
              <p className="text-red-400 text-xs mt-1">{errors.operatorid}</p>
            )}
          </div>

          <div>
            <label className="text-white/70 text-sm block mb-2">
              Start Time *
            </label>
            <input
              type="datetime-local"
              name="starttime"
              value={formData.starttime}
              onChange={(e) => {
                setFormData({ ...formData, starttime: e.target.value });
                setErrors({ ...errors, starttime: "" });
              }}
              className={`w-full bg-white/10 border ${
                errors.starttime ? "border-red-400" : "border-white/20"
              } text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/50`}
              required
            />
            {errors.starttime && (
              <p className="text-red-400 text-xs mt-1">{errors.starttime}</p>
            )}
          </div>

          <div>
            <label className="text-white/70 text-sm block mb-2">End Time</label>
            <input
              type="datetime-local"
              name="endtime"
              value={formData.endtime || ""}
              onChange={(e) =>
                setFormData({ ...formData, endtime: e.target.value })
              }
              className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
            />
          </div>

          <div>
            <label className="text-white/70 text-sm block mb-2">Status *</label>
            <select
              name="deliverystatus"
              value={formData.deliverystatus}
              onChange={(e) =>
                setFormData({ ...formData, deliverystatus: e.target.value })
              }
              className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
            >
              <option value="Scheduled" className="bg-slate-800">
                Scheduled
              </option>
              <option value="In-Progress" className="bg-slate-800">
                In-Progress
              </option>
              <option value="Completed" className="bg-slate-800">
                Completed
              </option>
              <option value="Failed" className="bg-slate-800">
                Failed
              </option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-medium"
            >
              {isEdit ? "Update" : "Add"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-gray-500 to-slate-600 text-white px-4 py-2 rounded-xl hover:from-gray-600 hover:to-slate-700 transition-all duration-300 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
