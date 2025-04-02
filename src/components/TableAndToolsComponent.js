import React, { useState } from "react";
import { Database, Filter, ArrowUpDown, Download, Table, ChevronDown } from "lucide-react";

const TableAndToolsComponent = () => {
  const [activeTab, setActiveTab] = useState("table");
  
  // Sample table data
  const tableData = {
    columns: ["ID", "Name", "Location", "Status", "Last Updated"],
    rows: [
      { id: 1, name: "Main Street Bridge", location: "Downtown", status: "Good", lastUpdated: "2023-05-15" },
      { id: 2, name: "River Crossing", location: "Westside", status: "Fair", lastUpdated: "2023-06-02" },
      { id: 3, name: "Highway Overpass", location: "North", status: "Poor", lastUpdated: "2023-04-30" },
      { id: 4, name: "Pedestrian Bridge", location: "Park Area", status: "Excellent", lastUpdated: "2023-07-10" },
      { id: 5, name: "Rail Bridge", location: "Industrial Zone", status: "Fair", lastUpdated: "2023-03-22" },
    ]
  };
  
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header with tabs */}
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <div className="flex space-x-4">
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "table" 
                ? "bg-teal-100 text-teal-800" 
                : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("table")}
          >
            <Table className="inline-block w-4 h-4 mr-2" />
            Table View
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "tools" 
                ? "bg-teal-100 text-teal-800" 
                : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("tools")}
          >
            <Database className="inline-block w-4 h-4 mr-2" />
            Analysis Tools
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100">
            <Filter className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100">
            <ArrowUpDown className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Content area */}
      {activeTab === "table" ? (
        <div className="flex-1 overflow-auto p-4">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {tableData.columns.map((column, index) => (
                    <th
                      key={index}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <div className="flex items-center">
                        {column}
                        <ChevronDown className="w-4 h-4 ml-1" />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tableData.rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {row.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {row.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {row.lastUpdated}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-medium text-gray-900 mb-2">Spatial Analysis</h3>
              <p className="text-sm text-gray-600 mb-4">Perform spatial operations on your data</p>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 bg-white border border-gray-200 rounded hover:bg-gray-50 text-sm">
                  Buffer Analysis
                </button>
                <button className="w-full text-left px-3 py-2 bg-white border border-gray-200 rounded hover:bg-gray-50 text-sm">
                  Nearest Neighbor
                </button>
                <button className="w-full text-left px-3 py-2 bg-white border border-gray-200 rounded hover:bg-gray-50 text-sm">
                  Overlay Analysis
                </button>
              </div>
            </div>
            
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-medium text-gray-900 mb-2">Data Statistics</h3>
              <p className="text-sm text-gray-600 mb-4">Calculate statistics on selected data</p>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 bg-white border border-gray-200 rounded hover:bg-gray-50 text-sm">
                  Summary Statistics
                </button>
                <button className="w-full text-left px-3 py-2 bg-white border border-gray-200 rounded hover:bg-gray-50 text-sm">
                  Correlation Analysis
                </button>
                <button className="w-full text-left px-3 py-2 bg-white border border-gray-200 rounded hover:bg-gray-50 text-sm">
                  Trend Detection
                </button>
              </div>
            </div>
            
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-medium text-gray-900 mb-2">Advanced Filtering</h3>
              <p className="text-sm text-gray-600 mb-4">Create complex filters for your data</p>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 bg-white border border-gray-200 rounded hover:bg-gray-50 text-sm">
                  Multi-attribute Filter
                </button>
                <button className="w-full text-left px-3 py-2 bg-white border border-gray-200 rounded hover:bg-gray-50 text-sm">
                  Spatial Query
                </button>
                <button className="w-full text-left px-3 py-2 bg-white border border-gray-200 rounded hover:bg-gray-50 text-sm">
                  Time Series Filter
                </button>
              </div>
            </div>
            
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-medium text-gray-900 mb-2">Export Options</h3>
              <p className="text-sm text-gray-600 mb-4">Export data in various formats</p>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 bg-white border border-gray-200 rounded hover:bg-gray-50 text-sm">
                  Export to CSV
                </button>
                <button className="w-full text-left px-3 py-2 bg-white border border-gray-200 rounded hover:bg-gray-50 text-sm">
                  Export to GeoJSON
                </button>
                <button className="w-full text-left px-3 py-2 bg-white border border-gray-200 rounded hover:bg-gray-50 text-sm">
                  Export to Shapefile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableAndToolsComponent;