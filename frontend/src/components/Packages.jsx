import React, { useState, useEffect } from "react";

export default function Packages() {
  const [packages, setPackages] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [currentPackage, setCurrentPackage] = useState(null);
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await fetch("http://localhost:5000/addresses");
        if (!res.ok) throw new Error("Failed to fetch addresses");
        const data = await res.json();
        setAddresses(data);
      } catch (err) {
        console.error("Error fetching addresses:", err);
      }
    };
    fetchAddresses();
  }, []);

  // Form state
  const [formData, setFormData] = useState({
    id: "",
    sender: "",
    receiver: "",
    dimensions: "",
    weight: "",
    priority: "Standard",
    status: "Pending",
  });

  // Fetch packages from backend
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5000/packages");
        if (!response.ok) throw new Error("Failed to fetch packages");
        const data = await response.json();
        setPackages(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching packages:", err);
        setError("Failed to load packages. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  // Open modal for adding new package
  const openAddModal = () => {
    setModalMode("add");
    setFormData({
      id: "",
      sender: "",
      receiver: "",
      dimensions: "",
      weight: "",
      priority: "Standard",
      status: "Pending",
    });
    setIsModalOpen(true);
  };

  // Open modal for editing package
  const openEditModal = (pkg) => {
    setModalMode("edit");
    setCurrentPackage(pkg);
    setFormData({
      id: pkg.id,
      sender: pkg.sender,
      receiver: pkg.receiver,
      dimensions: pkg.dimensions,
      weight: pkg.weight,
      priority: pkg.priority,
      status: pkg.status,
    });
    setIsModalOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Utility to convert formData to backend-ready format
  const mapFormDataToBackend = (data) => {
    // remove spaces and "cm"
    const dimsStr = data.dimensions.replace(/\s+/g, "").replace("cm", "");
    const dims = dimsStr.split("x").map(Number);

    if (dims.length !== 3 || dims.some(isNaN)) {
      throw new Error("Dimensions must be in format LxWxH, numbers only");
    }

    const weight = parseFloat(data.weight.replace(/\s*kg\s*/i, ""));
    if (isNaN(weight) || weight <= 0) {
      throw new Error("Weight must be a positive number");
    }

    const senderId = parseInt(data.sender);
    const receiverId = parseInt(data.receiver);

    if (!senderId || !receiverId) {
      throw new Error("Sender and Receiver must be selected");
    }

    return {
      priority: data.priority,
      dimensions: `${dims[0]}x${dims[1]}x${dims[2]}`,
      weight: weight,
      senderAddressId: senderId,
      receiverAddressId: receiverId,
    };
  };

  // ADD Package
  const addPackage = async () => {
    try {
      const body = mapFormDataToBackend(formData);
      console.log("Payload to backend:", body);

      const response = await fetch("http://localhost:5000/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to add package: ${errText}`);
      }

      const newPackage = await response.json();
      setPackages((prev) => [...prev, newPackage]);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error adding package:", err);
      alert(err.message);
    }
  };

  // EDIT Package
  const editPackage = async () => {
    try {
      const body = mapFormDataToBackend(formData);
      console.log("Sending update body:", body);

      const response = await fetch(
        `http://localhost:5000/packages/${formData.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      console.log("Response status:", response.status);

      if (!response.ok) throw new Error("Failed to update package");

      const updatedPackage = await response.json();
      console.log("Updated package received:", updatedPackage);

      setPackages((prev) =>
        prev.map((pkg) =>
          pkg.id === formData.id ? { ...pkg, ...updatedPackage } : pkg
        )
      );
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error updating package:", err);
      alert("Failed to update package");
    }
  };

  // Delete package
  const deletePackage = async (id) => {
    if (!window.confirm("Are you sure you want to delete this package?")) {
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/packages/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete package");
      setPackages((prev) => prev.filter((pkg) => pkg.id !== id));
    } catch (err) {
      console.error("Error deleting package:", err);
      alert("Failed to delete package");
    }
  };

  const filterOptions = ["All", "Express", "Standard"];

  const filteredPackages =
    selectedFilter === "All"
      ? packages
      : packages.filter((pkg) => pkg.priority === selectedFilter);

  // Group packages by priority
  const expressPackages = filteredPackages.filter(
    (pkg) => pkg.priority === "Express"
  );
  const standardPackages = filteredPackages.filter(
    (pkg) => pkg.priority === "Standard"
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-400/30";
      case "In Transit":
        return "bg-blue-500/20 text-blue-300 border-blue-400/30";
      case "Pending":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-400/30";
      case "Failed":
        return "bg-red-500/20 text-red-300 border-red-400/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-400/30";
    }
  };

  const PackageCard = ({ pkg }) => (
    <div
      className={`group relative backdrop-blur-xl bg-white/10 border ${
        pkg.priority === "Express"
          ? "border-red-400/50 shadow-red-400/20"
          : "border-white/20"
      } rounded-3xl p-6 shadow-2xl hover:shadow-3xl hover:bg-white/15 transition-all duration-500 hover:scale-105`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-teal-600/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-cyan-400/20 to-blue-600/20 p-3 rounded-xl border border-white/20">
              <span className="text-2xl">📦</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{pkg.id}</h3>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${
                    pkg.priority === "Express"
                      ? "bg-red-500/20 text-red-300 border-red-400/30"
                      : "bg-blue-500/20 text-blue-300 border-blue-400/30"
                  }`}
                >
                  {pkg.priority}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => openEditModal(pkg)}
              className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 p-2 rounded-lg border border-blue-400/30"
              title="Edit package"
            >
              ✏️
            </button>
            <button
              onClick={() => deletePackage(pkg.id)}
              className="bg-red-500/20 hover:bg-red-500/40 text-red-300 p-2 rounded-lg border border-red-400/30"
              title="Delete package"
            >
              🗑️
            </button>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3">
              <div className="text-white/60 text-xs mb-1">Dimensions</div>
              <div className="text-white font-semibold text-sm">
                {pkg.dimensions}
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3">
              <div className="text-white/60 text-xs mb-1">Weight</div>
              <div className="text-white font-semibold text-sm">
                {pkg.weight}
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg">📤</span>
                <div>
                  <div className="text-white/60 text-xs">Sender</div>
                  <div className="text-white font-semibold text-sm">
                    {pkg.sender}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-white/40">
                <div className="w-8 h-px bg-gradient-to-r from-cyan-400/50 to-blue-500/50"></div>
                <span className="text-xs">→</span>
                <div className="w-8 h-px bg-gradient-to-r from-blue-500/50 to-teal-400/50"></div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <div className="text-white/60 text-xs">Receiver</div>
                  <div className="text-white font-semibold text-sm">
                    {pkg.receiver}
                  </div>
                </div>
                <span className="text-lg">📥</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen w-full fixed inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading packages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full fixed inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-blue-900 flex items-center justify-center">
        <div className="text-center backdrop-blur-xl bg-white/10 border border-red-400/30 rounded-3xl p-8 max-w-md">
          <span className="text-6xl mb-4 block">⚠️</span>
          <p className="text-red-300 text-xl mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 px-6 py-2 rounded-lg border border-cyan-400/30 transition-all"
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
                  Package Management
                </h1>
                <p className="text-white/70 text-sm mt-1">
                  Track and organize package deliveries
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <span className="text-red-300 text-sm font-medium">
                  {expressPackages.length} Express
                </span>
              </div>
              <button
                onClick={openAddModal}
                className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/40 hover:to-blue-500/40 text-cyan-300 px-6 py-2 rounded-xl border border-cyan-400/30 transition-all font-medium flex items-center space-x-2"
              >
                <span className="text-xl">➕</span>
                <span>Add Package</span>
              </button>
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
                  Package Overview
                </h2>
                <p className="text-white/60 text-sm">
                  {filteredPackages.length} of {packages.length} packages shown
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <label className="text-white/70 text-sm font-medium">
                  Filter by Priority:
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
              </div>
            </div>
          </div>
        </div>

        {(selectedFilter === "All" || selectedFilter === "Express") &&
          expressPackages.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-400/30 p-3 rounded-xl">
                  <span className="text-xl">🚨</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    Express Packages
                  </h3>
                  <p className="text-red-300 text-sm">
                    High priority deliveries ({expressPackages.length})
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {expressPackages.map((pkg) => (
                  <PackageCard key={pkg.id} pkg={pkg} />
                ))}
              </div>
            </div>
          )}

        {(selectedFilter === "All" || selectedFilter === "Standard") &&
          standardPackages.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-400/30 p-3 rounded-xl">
                  <span className="text-xl">📋</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    Standard Packages
                  </h3>
                  <p className="text-blue-300 text-sm">
                    Regular deliveries ({standardPackages.length})
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {standardPackages.map((pkg) => (
                  <PackageCard key={pkg.id} pkg={pkg} />
                ))}
              </div>
            </div>
          )}

        {filteredPackages.length === 0 && (
          <div className="text-center py-16">
            <span className="text-6xl mb-4 block">📭</span>
            <p className="text-white/60 text-xl">No packages found</p>
          </div>
        )}

        {packages.length > 0 && (
          <div className="mt-12">
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-slate-600/20 to-blue-600/20 px-8 py-6 border-b border-white/10">
                <h3 className="text-xl font-bold text-white mb-1">
                  Package Statistics
                </h3>
                <p className="text-white/60 text-sm">
                  Package priority and status overview
                </p>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl border border-red-400/30 bg-red-500/20 flex items-center justify-center">
                      <span className="text-xl text-red-300">🚨</span>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                      {packages.filter((p) => p.priority === "Express").length}
                    </div>
                    <div className="text-white/60 text-xs">Express</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl border border-blue-400/30 bg-blue-500/20 flex items-center justify-center">
                      <span className="text-xl text-blue-300">📋</span>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                      {packages.filter((p) => p.priority === "Standard").length}
                    </div>
                    <div className="text-white/60 text-xs">Standard</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl border border-emerald-400/30 bg-emerald-500/20 flex items-center justify-center">
                      <span className="text-xl text-emerald-300">✅</span>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                      {packages.filter((p) => p.status === "Delivered").length}
                    </div>
                    <div className="text-white/60 text-xs">Delivered</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl border border-yellow-400/30 bg-yellow-500/20 flex items-center justify-center">
                      <span className="text-xl text-yellow-300">⏳</span>
                    </div>

                    <div className="text-white/60 text-xs">In Progress</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 max-w-2xl w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {modalMode === "add" ? "Add New Package" : "Edit Package"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/60 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-white/70 text-sm mb-2">
                  Package ID
                </label>
                <input
                  type="text"
                  name="id"
                  value={formData.id}
                  onChange={handleInputChange}
                  disabled={modalMode === "edit"}
                  className="w-full backdrop-blur-sm bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 disabled:opacity-50"
                  placeholder="PKG-001"
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-2">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full backdrop-blur-sm bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                >
                  <option value="Standard" className="bg-slate-800">
                    Standard
                  </option>
                  <option value="Express" className="bg-slate-800">
                    Express
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-2">
                  Sender
                </label>
                <select
                  name="sender"
                  value={formData.sender}
                  onChange={handleInputChange}
                  className="w-full backdrop-blur-sm bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                >
                  <option value="">Select sender</option>
                  {addresses.map((addr) => (
                    <option key={addr.id} value={addr.id}>
                      {addr.street}, {addr.city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-2">
                  Receiver
                </label>
                <select
                  name="receiver"
                  value={formData.receiver}
                  onChange={handleInputChange}
                  className="w-full backdrop-blur-sm bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                >
                  <option value="">Select receiver</option>
                  {addresses.map((addr) => (
                    <option key={addr.id} value={addr.id}>
                      {addr.street}, {addr.city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-2">
                  Dimensions
                </label>
                <input
                  type="text"
                  name="dimensions"
                  value={formData.dimensions}
                  onChange={handleInputChange}
                  className="w-full backdrop-blur-sm bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                  placeholder="30x20x15 cm"
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-2">
                  Weight
                </label>
                <input
                  type="text"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className="w-full backdrop-blur-sm bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                  placeholder="2.5 kg"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-xl border border-white/20 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={modalMode === "add" ? addPackage : editPackage}
                className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/40 hover:to-blue-500/40 text-cyan-300 px-6 py-2 rounded-xl border border-cyan-400/30 transition-all font-medium"
              >
                {modalMode === "add" ? "Add Package" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
