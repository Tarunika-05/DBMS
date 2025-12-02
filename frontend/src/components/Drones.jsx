import React, { useState, useEffect } from "react";

export default function Drones() {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [drones, setDrones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingDrone, setEditingDrone] = useState(null);
  const [newDrone, setNewDrone] = useState({
    model: "",
    maxloadkg: "",
    batterycapacity: "",
    status: "Available",
    battery: "", // new battery field added
  });

  // Backend API URL - adjust this to match your server
  const API_URL = "http://localhost:5000";

  // Fetch drones from backend
  useEffect(() => {
    fetchDrones();
  }, []);

  const fetchDrones = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/drones`);
      if (!response.ok) throw new Error("Failed to fetch drones");
      const data = await response.json();
      console.log("Received drone data:", data);
      setDrones(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching drones:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update drone status
  const handleStatusChange = async (droneId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/drones/${droneId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error("Failed to update drone");
      const updatedDrone = await response.json();
      setDrones((prev) =>
        prev.map((d) => (d.id === droneId ? updatedDrone : d))
      );
    } catch (err) {
      console.error("Error updating drone:", err);
      alert("Failed to update drone status");
    }
  };

  // Deploy drone
  const handleDeploy = (droneId) => {
    handleStatusChange(droneId, "In-Transit");
  };

  // Delete drone
  const handleDelete = async (droneid) => {
    if (!confirm("Are you sure you want to delete this drone?")) return;
    try {
      const response = await fetch(`${API_URL}/drones/${droneid}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete drone");
      setDrones((prev) => prev.filter((d) => d.droneid !== droneid));
    } catch (err) {
      console.error("Error deleting drone:", err);
      alert("Failed to delete drone");
    }
  };

  // Add new drone
  const handleAddDrone = async (e) => {
    e.preventDefault();

    // Ensure numeric fields are numbers
    const payload = {
      model: newDrone.model,
      maxloadkg: parseFloat(newDrone.maxloadkg),
      batterycapacity: parseFloat(newDrone.batterycapacity),
      status: newDrone.status,
      battery: parseFloat(newDrone.battery), // add battery here
    };

    try {
      const response = await fetch(`${API_URL}/drones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json(); // optional: get backend error message
        throw new Error(errorData.message || "Failed to add drone");
      }

      const addedDrone = await response.json();
      setDrones((prev) => [...prev, addedDrone]);

      setNewDrone({
        model: "",
        maxloadkg: "",
        batterycapacity: "",
        status: "Available",
        battery: "", // reset battery field
      });

      setShowAddForm(false);
      alert("Drone added successfully!");
    } catch (err) {
      console.error("Error adding drone:", err);
      alert("Failed to add drone: " + err.message);
    }
  };

  // Open edit form
  const handleEditClick = (drone) => {
    setEditingDrone({
      id: drone.id,
      model: drone.model,
      maxloadkg: drone.maxloadkg,
      batterycapacity: drone.batterycapacity,
      status: drone.status,
      battery: drone.battery, // add battery here
    });

    setShowEditForm(true);
  };

  // Update drone (full update)
  const handleUpdateDrone = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/drones/${editingDrone.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: editingDrone.model,
          maxloadkg: editingDrone.maxloadkg,
          batterycapacity: editingDrone.batterycapacity,
          status: editingDrone.status,
          battery: parseFloat(editingDrone.battery), // add battery here
        }),
      });
      if (!response.ok) throw new Error("Failed to update drone");
      const updatedDrone = await response.json();
      setDrones((prev) =>
        prev.map((d) => (d.id === editingDrone.id ? updatedDrone : d))
      );
      setShowEditForm(false);
      setEditingDrone(null);
      alert("Drone updated successfully!");
    } catch (err) {
      console.error("Error updating drone:", err);
      alert("Failed to update drone");
    }
  };

  const filterOptions = [
    "All",
    "Available",
    "In-Transit",
    "Charging",
    "Maintenance",
    "Low Battery",
  ];

  const filteredDrones =
    selectedFilter === "All"
      ? drones
      : drones.filter((drone) => drone.status === selectedFilter);

  const getStatusColor = (status) => {
    switch (status) {
      case "Available":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-400/30";
      case "In-Transit":
        return "bg-blue-500/20 text-blue-300 border-blue-400/30";
      case "Charging":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-400/30";
      case "Maintenance":
        return "bg-red-500/20 text-red-300 border-red-400/30";
      case "Low Battery":
        return "bg-orange-500/20 text-orange-300 border-orange-400/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-400/30";
    }
  };

  const getBatteryColor = (battery) => {
    if (battery > 60) return "from-emerald-400 to-green-500";
    if (battery > 30) return "from-yellow-400 to-orange-500";
    return "from-red-400 to-red-600";
  };

  const getBatteryGlow = (battery) => {
    if (battery > 60) return "shadow-emerald-400/50";
    if (battery > 30) return "shadow-yellow-400/50";
    return "shadow-red-400/50";
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen w-full fixed inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-cyan-400 border-t-transparent mb-4"></div>
          <p className="text-white text-xl">Loading drones...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen w-full fixed inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-blue-900 flex items-center justify-center">
        <div className="text-center backdrop-blur-xl bg-white/10 border border-red-400/30 rounded-3xl p-8 max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Connection Error
          </h2>
          <p className="text-red-300 mb-4">{error}</p>
          <button
            onClick={fetchDrones}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2 rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full fixed inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-blue-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-teal-400 to-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-60 h-60 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="w-full relative z-10 backdrop-blur-md bg-white/10 border-b border-white/20 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="bg-gradient-to-br from-cyan-400 via-blue-500 to-teal-600 p-4 rounded-2xl shadow-2xl ring-4 ring-white/20">
                  <span className="text-3xl filter drop-shadow-lg">🛸</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full"></div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-cyan-200 to-blue-300 bg-clip-text text-transparent drop-shadow-lg">
                  Drone Fleet Management
                </h1>
                <p className="text-white/70 text-sm mt-1">
                  Monitor and manage your drone fleet
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-300 text-sm font-medium">
                {filteredDrones.filter((d) => d.status === "Available").length}{" "}
                Available
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full relative z-10 max-w-7xl mx-auto px-6 py-10 overflow-y-auto h-full">
        {/* Filter Controls */}
        <div className="mb-8">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">
                  Fleet Overview
                </h2>
                <p className="text-white/60 text-sm">
                  {filteredDrones.length} of {drones.length} drones shown
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <label className="text-white/70 text-sm font-medium">
                  Filter by Status:
                </label>
                <div className="relative">
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="backdrop-blur-sm bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
                  >
                    {filterOptions.map((option) => (
                      <option
                        key={option}
                        value={option}
                        className="bg-slate-800 text-white"
                      >
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/20"
                >
                  + Add Drone
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Add Drone Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Add New Drone</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-white/60 hover:text-white text-2xl transition-colors"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleAddDrone} className="space-y-4">
                <div>
                  <label className="text-white/70 text-sm font-medium block mb-2">
                    Model
                  </label>
                  <input
                    type="text"
                    value={newDrone.model}
                    onChange={(e) =>
                      setNewDrone({ ...newDrone, model: e.target.value })
                    }
                    className="w-full backdrop-blur-sm bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
                    placeholder="e.g., DJI Phantom 4"
                    required
                  />
                </div>
                <div>
                  <label className="text-white/70 text-sm font-medium block mb-2">
                    Max Load (kg)
                  </label>
                  <input
                    type="number"
                    value={newDrone.maxloadkg}
                    onChange={(e) =>
                      setNewDrone({ ...newDrone, maxloadkg: e.target.value })
                    }
                    className="w-full backdrop-blur-sm bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
                    placeholder="e.g., 5"
                    required
                  />
                </div>
                <div>
                  <label className="text-white/70 text-sm font-medium block mb-2">
                    Battery Capacity (mAh)
                  </label>
                  <input
                    type="number"
                    value={newDrone.batterycapacity}
                    onChange={(e) =>
                      setNewDrone({
                        ...newDrone,
                        batterycapacity: e.target.value,
                      })
                    }
                    className="w-full backdrop-blur-sm bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
                    placeholder="e.g., 5000"
                    required
                  />
                </div>
                <div>
                  <label className="text-white/70 text-sm font-medium block mb-2">
                    Status
                  </label>
                  <select
                    value={newDrone.status}
                    onChange={(e) =>
                      setNewDrone({ ...newDrone, status: e.target.value })
                    }
                    className="w-full backdrop-blur-sm bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
                  >
                    {filterOptions.slice(1).map((option) => (
                      <option
                        key={option}
                        value={option}
                        className="bg-slate-800 text-white"
                      >
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-white/70 text-sm font-medium block mb-2">
                    Battery Level (%)
                  </label>
                  <input
                    type="number"
                    value={newDrone.battery}
                    onChange={(e) =>
                      setNewDrone({ ...newDrone, battery: e.target.value })
                    }
                    className="w-full backdrop-blur-sm bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
                    placeholder="e.g., 100"
                    required
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-xl font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-cyan-400/20"
                  >
                    Add Drone
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Drone Form Modal */}
        {showEditForm && editingDrone && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Edit Drone</h3>
                <button
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingDrone(null);
                  }}
                  className="text-white/60 hover:text-white text-2xl transition-colors"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleUpdateDrone} className="space-y-4">
                <div>
                  <label className="text-white/70 text-sm font-medium block mb-2">
                    Drone ID
                  </label>
                  <input
                    type="text"
                    value={editingDrone.id}
                    disabled
                    className="w-full backdrop-blur-sm bg-white/5 border border-white/20 text-white/50 rounded-xl px-4 py-2 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-white/70 text-sm font-medium block mb-2">
                    Model
                  </label>
                  <input
                    type="text"
                    value={editingDrone.model}
                    onChange={(e) =>
                      setEditingDrone({
                        ...editingDrone,
                        model: e.target.value,
                      })
                    }
                    className="w-full backdrop-blur-sm bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="text-white/70 text-sm font-medium block mb-2">
                    Max Load (kg)
                  </label>
                  <input
                    type="number"
                    value={editingDrone.maxloadkg}
                    onChange={(e) =>
                      setEditingDrone({
                        ...editingDrone,
                        maxloadkg: e.target.value,
                      })
                    }
                    className="w-full backdrop-blur-sm bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="text-white/70 text-sm font-medium block mb-2">
                    Battery Capacity (mAh)
                  </label>
                  <input
                    type="number"
                    value={editingDrone.batterycapacity}
                    onChange={(e) =>
                      setEditingDrone({
                        ...editingDrone,
                        batterycapacity: e.target.value,
                      })
                    }
                    className="w-full backdrop-blur-sm bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="text-white/70 text-sm font-medium block mb-2">
                    Status
                  </label>
                  <select
                    value={editingDrone.status}
                    onChange={(e) =>
                      setEditingDrone({
                        ...editingDrone,
                        status: e.target.value,
                      })
                    }
                    className="w-full backdrop-blur-sm bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
                  >
                    {filterOptions.slice(1).map((option) => (
                      <option
                        key={option}
                        value={option}
                        className="bg-slate-800 text-white"
                      >
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-white/70 text-sm font-medium block mb-2">
                    Battery Level (%)
                  </label>
                  <input
                    type="number"
                    value={editingDrone.battery}
                    onChange={(e) =>
                      setEditingDrone({
                        ...editingDrone,
                        battery: e.target.value,
                      })
                    }
                    className="w-full backdrop-blur-sm bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
                    placeholder="e.g., 100"
                    required
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditForm(false);
                      setEditingDrone(null);
                    }}
                    className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-xl font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-cyan-400/20"
                  >
                    Update Drone
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Drones Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDrones.map((drone, index) => (
            <div
              key={drone.id}
              className="group relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl hover:shadow-3xl hover:bg-white/15 transition-all duration-500 hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-teal-600/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-br from-cyan-400/20 to-blue-600/20 p-3 rounded-xl border border-white/20">
                      <span className="text-2xl">🛸</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {drone.id}
                      </h3>
                      <p className="text-white/60 text-sm">{drone.model}</p>
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${getStatusColor(
                      drone.status
                    )}`}
                  >
                    {drone.status}
                  </div>
                </div>

                {/* Battery Level */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/70 text-sm font-medium">
                      Battery Level
                    </span>
                    <span className="text-white font-bold text-sm">
                      {drone.battery}%
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 border border-white/20 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${getBatteryColor(
                        drone.battery
                      )} rounded-full transition-all duration-1000 shadow-lg ${getBatteryGlow(
                        drone.battery
                      )}`}
                      style={{ width: `${drone.battery}%` }}
                    ></div>
                  </div>
                </div>

                {/* Specifications */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-sm">Max Load:</span>
                    <span className="text-white font-semibold text-sm">
                      {drone.maxloadkg} kg
                    </span>
                  </div>
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-sm">
                      Battery Capacity
                    </span>
                    <span className="text-white font-semibold text-sm">
                      {drone.batterycapacity} mAh
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex space-x-2">
                  {drone.status === "Available" && (
                    <button
                      onClick={() => handleDeploy(drone.id)}
                      className="flex-1 bg-gradient-to-r from-emerald-500/20 to-teal-600/20 hover:from-emerald-500/30 hover:to-teal-600/30 border border-emerald-400/30 text-emerald-300 text-xs font-medium py-2 px-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-emerald-400/20"
                    >
                      Deploy
                    </button>
                  )}
                  {drone.status === "In-Transit" && (
                    <button
                      onClick={() => handleStatusChange(drone.id, "Available")}
                      className="flex-1 bg-gradient-to-r from-blue-500/20 to-cyan-600/20 hover:from-blue-500/30 hover:to-cyan-600/30 border border-blue-400/30 text-blue-300 text-xs font-medium py-2 px-3 rounded-xl transition-all duration-300"
                    >
                      Return to Base
                    </button>
                  )}
                  <button
                    onClick={() => handleEditClick(drone)}
                    className="px-3 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400/30 text-yellow-300 text-xs font-medium rounded-xl transition-all duration-300"
                    title="Edit drone"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(drone.droneid)}
                    className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 text-red-300 text-xs font-medium rounded-xl transition-all duration-300"
                    title="Delete drone"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Fleet Statistics */}
        <div className="mt-12">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-slate-600/20 to-blue-600/20 px-8 py-6 border-b border-white/10">
              <h3 className="text-xl font-bold text-white mb-1">
                Fleet Statistics
              </h3>
              <p className="text-white/60 text-sm">
                Real-time fleet status overview
              </p>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {filterOptions.slice(1).map((status) => {
                  const count = drones.filter(
                    (drone) => drone.status === status
                  ).length;
                  return (
                    <div key={status} className="text-center">
                      <div
                        className={`w-12 h-12 mx-auto mb-3 rounded-xl border flex items-center justify-center ${getStatusColor(
                          status
                        )}`}
                      >
                        <span className="text-xl">
                          {status === "Available"
                            ? "✅"
                            : status === "In-Transit"
                            ? "🚁"
                            : status === "Charging"
                            ? "🔋"
                            : status === "Maintenance"
                            ? "🔧"
                            : "⚡"}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">
                        {count}
                      </div>
                      <div className="text-white/60 text-xs">{status}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
