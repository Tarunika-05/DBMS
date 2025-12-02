import React, { useState, useEffect } from "react";

export default function Operators() {
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    certificationId: "",
    contactNumber: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    firstname: "",
    lastname: "",
    certificationId: "",
    contactNumber: "",
  });

  // Extracted fetchOperators so it can be reused
  const fetchOperators = async () => {
    try {
      const response = await fetch("http://localhost:5000/operators");

      if (!response.ok) {
        throw new Error("Failed to fetch operators");
      }
      const data = await response.json();
      console.log(data);
      setOperators(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching operators:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Fetch operators from backend on mount
  useEffect(() => {
    fetchOperators();
  }, []);

  // Add new operator
  const addOperator = async () => {
    const errors = {};
    if (!formData.firstname.trim()) errors.firstname = "First name is required";
    if (!formData.lastname.trim()) errors.lastname = "Last name is required";
    if (!formData.certificationId.trim())
      errors.certificationId = "Certification ID is required";
    if (!formData.contactNumber.trim())
      errors.contactNumber = "Contact number is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("http://localhost:5000/operators", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstname: formData.firstname,
          lastname: formData.lastname,
          certificationid: formData.certificationId,
          contactnumber: formData.contactNumber,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add operator");
      }

      // Re-fetch from DB to get the actual saved data
      await fetchOperators();

      setFormData({
        firstname: "",
        lastname: "",
        certificationId: "",
        contactNumber: "",
      });
      setFormErrors({});
      setShowAddForm(false);
    } catch (err) {
      console.error("Error adding operator:", err);
      alert("Failed to add operator: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      addOperator();
    }
  };

  // Update operator
  const updateOperator = async (id) => {
    const errors = {};
    if (!editFormData.firstname.trim())
      errors.firstname = "First name is required";
    if (!editFormData.lastname.trim())
      errors.lastname = "Last name is required";
    if (!editFormData.certificationId.trim())
      errors.certificationId = "Certification ID is required";
    if (!editFormData.contactNumber.trim())
      errors.contactNumber = "Contact number is required";

    if (Object.keys(errors).length > 0) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/operators/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstname: editFormData.firstname,
          lastname: editFormData.lastname,
          certificationid: editFormData.certificationId,
          contactnumber: editFormData.contactNumber,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to update operator");
      }
      // Re-fetch from DB to get the updated data
      await fetchOperators();
      setEditingId(null);
      setEditFormData({
        firstname: "",
        lastname: "",
        certificationId: "",
        contactNumber: "",
      });
    } catch (err) {
      console.error("Error updating operator:", err);
      alert("Failed to update operator");
    }
  };

  // Delete operator
  const deleteOperator = async (id) => {
    if (!confirm("Are you sure you want to delete this operator?")) return;

    try {
      const response = await fetch(`http://localhost:5000/operators/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete operator");
      }
      // Re-fetch from DB after deletion
      await fetchOperators();
    } catch (err) {
      console.error("Error deleting operator:", err);
      alert("Failed to delete operator");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full fixed inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-400 mb-4"></div>
          <p className="text-white text-xl">Loading operators...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full fixed inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-blue-900 flex items-center justify-center">
        <div className="text-center bg-red-500/20 border border-red-500/50 rounded-2xl p-8">
          <p className="text-red-300 text-xl">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
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
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 left-1/2 w-60 h-60 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse"></div>
      </div>

      <header className="w-full relative z-10 backdrop-blur-md bg-white/10 border-b border-white/20 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="bg-gradient-to-br from-cyan-400 via-blue-500 to-teal-600 p-4 rounded-2xl shadow-2xl ring-4 ring-white/20">
                  <span className="text-3xl filter drop-shadow-lg">👨‍✈️</span>
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-cyan-200 to-blue-300 bg-clip-text text-transparent drop-shadow-lg">
                  Operators
                </h1>
                <p className="text-white/70 text-sm mt-1">
                  Certified drone operators ({operators.length})
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              {showAddForm ? "✕ Cancel" : "+ Add Operator"}
            </button>
          </div>
        </div>
      </header>

      <main className="w-full relative z-10 max-w-7xl mx-auto px-6 py-10 overflow-y-auto h-full">
        {showAddForm && (
          <div className="mb-8 backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">
              Add New Operator
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    placeholder="Enter first name"
                  />
                  {formErrors.firstname && (
                    <p className="text-red-400 text-sm mt-1">
                      {formErrors.firstname}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    placeholder="Enter last name"
                  />
                  {formErrors.lastname && (
                    <p className="text-red-400 text-sm mt-1">
                      {formErrors.lastname}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Certification ID *
                  </label>
                  <input
                    type="text"
                    name="certificationId"
                    value={formData.certificationId}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    placeholder="Enter certification ID"
                  />
                  {formErrors.certificationId && (
                    <p className="text-red-400 text-sm mt-1">
                      {formErrors.certificationId}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Contact Number *
                  </label>
                  <input
                    type="text"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    placeholder="Enter contact number"
                  />
                  {formErrors.contactNumber && (
                    <p className="text-red-400 text-sm mt-1">
                      {formErrors.contactNumber}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={addOperator}
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Adding..." : "Add Operator"}
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({
                      firstname: "",
                      lastname: "",
                      certificationId: "",
                      contactNumber: "",
                    });
                    setFormErrors({});
                  }}
                  className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {operators.length === 0 ? (
          <div className="text-center text-white/70 py-20">
            <p className="text-xl">No operators found</p>
            <p className="text-sm mt-2">
              Click "Add Operator" to create your first operator
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {operators.map((operator) => (
              <div
                key={operator.id}
                className="group relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl hover:shadow-3xl hover:bg-white/15 transition-all duration-500 hover:scale-[1.02]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-teal-600/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative z-10">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    <div className="flex items-center space-x-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-2xl border-2 border-white/20 flex items-center justify-center shadow-2xl">
                        <span className="text-4xl">
                          {operator.avatar || "👨‍✈️"}
                        </span>
                      </div>

                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-2">
                          {operator.fullname}
                        </h3>
                        <div className="space-y-1 text-white/70 text-sm">
                          <p>
                            <span className="text-white/50">ID:</span>{" "}
                            {operator.id}
                          </p>
                          <p>
                            <span className="text-white/50">
                              Certification:
                            </span>{" "}
                            {operator.certificationId}
                          </p>
                          <p>
                            <span className="text-white/50">Contact:</span>{" "}
                            {operator.contactNumber}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6"></div>
                  </div>

                  <div className="mt-6 flex flex-col gap-3">
                    {editingId === operator.id ? (
                      <div className="space-y-4 p-4 bg-white/5 rounded-xl border border-cyan-400/30">
                        <h4 className="text-white font-semibold mb-3">
                          Edit Operator
                        </h4>
                        <div className="grid grid-cols-1 gap-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-white/70 text-xs mb-1">
                                First Name
                              </label>
                              <input
                                type="text"
                                value={editFormData.firstname}
                                onChange={(e) =>
                                  setEditFormData((prev) => ({
                                    ...prev,
                                    firstname: e.target.value,
                                  }))
                                }
                                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                                placeholder="First name"
                              />
                            </div>
                            <div>
                              <label className="block text-white/70 text-xs mb-1">
                                Last Name
                              </label>
                              <input
                                type="text"
                                value={editFormData.lastname}
                                onChange={(e) =>
                                  setEditFormData((prev) => ({
                                    ...prev,
                                    lastname: e.target.value,
                                  }))
                                }
                                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                                placeholder="Last name"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-white/70 text-xs mb-1">
                                Certification ID
                              </label>
                              <input
                                type="text"
                                value={editFormData.certificationId}
                                onChange={(e) =>
                                  setEditFormData((prev) => ({
                                    ...prev,
                                    certificationId: e.target.value,
                                  }))
                                }
                                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                                placeholder="Certification ID"
                              />
                            </div>
                            <div>
                              <label className="block text-white/70 text-xs mb-1">
                                Contact Number
                              </label>
                              <input
                                type="text"
                                value={editFormData.contactNumber}
                                onChange={(e) =>
                                  setEditFormData((prev) => ({
                                    ...prev,
                                    contactNumber: e.target.value,
                                  }))
                                }
                                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                                placeholder="Contact number"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => updateOperator(operator.id)}
                            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm transition-colors"
                          >
                            Save Changes
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditFormData({
                                firstname: "",
                                lastname: "",
                                certificationId: "",
                                contactNumber: "",
                              });
                            }}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setEditingId(operator.id);
                            setEditFormData({
                              firstname: operator.firstname || "",
                              lastname: operator.lastname || "",
                              certificationId: operator.certificationId || "",
                              contactNumber: operator.contactNumber || "",
                            });
                          }}
                          className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 text-cyan-300 rounded-lg transition-colors text-sm"
                        >
                          Edit Operator
                        </button>
                        <button
                          onClick={() => deleteOperator(operator.id)}
                          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 text-red-300 rounded-lg transition-colors text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
