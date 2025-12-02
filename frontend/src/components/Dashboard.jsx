import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Drones from "./Drones";
import Operators from "./Operators";
import Deliveries from "./Deliveries";
import Packages from "./Packages";

export default function DronePortal() {
  const navigate = useNavigate();

  // Replace mock data with state
  const [systemStats, setSystemStats] = useState({
    totalDrones: 0,
    totalOperators: 0,
    totalPackages: 0,
    totalDeliveries: 0,
  });

  const [statusSummary, setStatusSummary] = useState({
    availableDrones: 0,
    activeDeliveries: 0,
    completedDeliveries: 0,
  });

  const [recentActivity, setRecentActivity] = useState([]);

  // Fetch real data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dronesRes, operatorsRes, packagesRes, deliveriesRes] =
          await Promise.all([
            fetch("http://localhost:5000/drones"),
            fetch("http://localhost:5000/operators"),
            fetch("http://localhost:5000/packages"),
            fetch("http://localhost:5000/deliveries"),
          ]);

        const drones = await dronesRes.json();
        const operators = await operatorsRes.json();
        const packages = await packagesRes.json();
        const deliveries = await deliveriesRes.json();

        // Update system stats
        setSystemStats({
          totalDrones: drones.length,
          totalOperators: operators.length,
          totalPackages: packages.length,
          totalDeliveries: deliveries.length,
        });

        // Update status summary
        setStatusSummary({
          availableDrones: drones.filter((d) => d.status === "available")
            .length,
          activeDeliveries: deliveries.filter((d) => d.status === "active")
            .length,
          completedDeliveries: deliveries.filter(
            (d) => d.status === "completed"
          ).length,
        });

        // Generate recent activity
        const activityLogs = [
          ...packages.slice(-3).map((pkg) => ({
            id: `pkg-${pkg.id}`,
            message: `New package #${pkg.id} registered in system`,
            time: "just now",
            type: "info",
          })),
          ...deliveries.slice(-3).map((del) => ({
            id: `del-${del.id}`,
            message: `Delivery #${del.id} status: ${del.status}`,
            time: "recently",
            type: del.status === "completed" ? "success" : "warning",
          })),
        ];

        setRecentActivity(activityLogs);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  const navigationItems = [
    {
      id: "drones",
      name: "Drones",
      icon: "🛸",
      count: systemStats.totalDrones,
      description: "Manage fleet & status",
      color: "from-blue-500 to-teal-600",
      route: "/drones",
    },
    {
      id: "operators",
      name: "Operators",
      icon: "👨‍💼",
      count: systemStats.totalOperators,
      description: "Staff management",
      color: "from-emerald-500 to-teal-600",
      route: "/operators",
    },
    {
      id: "deliveries",
      name: "Deliveries",
      icon: "📦",
      count: systemStats.totalDeliveries,
      description: "Delivery tracking",
      color: "from-slate-500 to-gray-600",
      route: "/deliveries",
    },
    {
      id: "packages",
      name: "Packages",
      icon: "📋",
      count: systemStats.totalPackages,
      description: "Package inventory",
      color: "from-blue-500 to-indigo-600",
      route: "/packages",
    },
  ];

  return (
    <div className="min-h-screen w-full fixed-inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-blue-900 relative overflow-hidden">
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
                  <span className="text-3xl filter drop-shadow-lg">🏢</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full"></div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-cyan-200 to-blue-300 bg-clip-text text-transparent drop-shadow-lg">
                  Drone Delivery Tracking System
                </h1>
                <p className="text-white/70 text-sm mt-1">
                  Central dashboard & system overview
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-300 text-sm font-medium">
                System Online
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full relative z-10 max-w-7xl mx-auto px-6 py-10">
        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Total Drones */}
          <div className="group relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-3xl hover:bg-white/15 transition-all duration-500 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-teal-600/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-medium text-white/70 mb-1">
                    Total Drones
                  </h3>
                  <div className="w-12 h-1 bg-gradient-to-r from-blue-400 to-teal-500 rounded-full"></div>
                </div>
                <span className="text-5xl">🛸</span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  {systemStats.totalDrones}
                </span>
                <span className="text-white/60 text-sm">units</span>
              </div>
            </div>
          </div>

          {/* Total Operators */}
          <div className="group relative backdrop-blur-xl bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-400/30 rounded-3xl p-8 shadow-2xl hover:shadow-3xl hover:from-emerald-500/30 hover:to-teal-600/30 transition-all duration-500 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-teal-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-medium text-emerald-200 mb-1">
                    Total Operators
                  </h3>
                  <div className="w-12 h-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"></div>
                </div>
                <span className="text-5xl">👨‍💼</span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-4xl font-black text-white drop-shadow-2xl">
                  {systemStats.totalOperators}
                </span>
                <span className="text-emerald-200/60 text-sm">staff</span>
              </div>
            </div>
          </div>

          {/* Total Packages */}
          <div className="group relative backdrop-blur-xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border border-blue-400/30 rounded-3xl p-8 shadow-2xl hover:shadow-3xl hover:from-blue-500/30 hover:to-indigo-600/30 transition-all duration-500 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-indigo-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-medium text-blue-200 mb-1">
                    Total Packages
                  </h3>
                  <div className="w-12 h-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full"></div>
                </div>
                <span className="text-5xl">📋</span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-4xl font-black text-white drop-shadow-2xl">
                  {systemStats.totalPackages.toLocaleString()}
                </span>
                <span className="text-blue-200/60 text-sm">items</span>
              </div>
            </div>
          </div>

          {/* Total Deliveries */}
          <div className="group relative backdrop-blur-xl bg-gradient-to-br from-slate-500/20 to-gray-600/20 border border-slate-400/30 rounded-3xl p-8 shadow-2xl hover:shadow-3xl hover:from-slate-500/30 hover:to-gray-600/30 transition-all duration-500 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-400/10 to-gray-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-medium text-slate-200 mb-1">
                    Total Deliveries
                  </h3>
                  <div className="w-12 h-1 bg-gradient-to-r from-slate-400 to-gray-500 rounded-full"></div>
                </div>
                <span className="text-5xl">📦</span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-4xl font-black text-white drop-shadow-2xl">
                  {systemStats.totalDeliveries.toLocaleString()}
                </span>
                <span className="text-slate-200/60 text-sm">completed</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Navigation Cards */}
          <div>
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-slate-600/20 to-blue-600/20 px-8 py-6 border-b border-white/10">
                <h2 className="text-2xl font-bold text-white mb-1">
                  System Modules
                </h2>
                <p className="text-white/60 text-sm">
                  Navigate to different sections
                </p>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {navigationItems.map((item, index) => (
                    <div
                      key={item.name}
                      onClick={() => navigate(item.route)}
                      className={`group relative backdrop-blur-sm bg-gradient-to-br ${item.color}/20 border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-500 cursor-pointer`}
                    >
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${item.color}/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                      ></div>
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-3xl">{item.icon}</span>
                          <span className="text-2xl font-black text-white">
                            {item.count.toLocaleString()}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">
                          {item.name}
                        </h3>
                        <p className="text-white/70 text-sm">
                          {item.description}
                        </p>
                        <div className="mt-4 flex items-center text-white/50 text-sm">
                          <span>View details</span>
                          <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">
                            →
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
