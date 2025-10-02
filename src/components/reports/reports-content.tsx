"use client";

import { useState, useEffect } from "react";
import { Download, FileText, BarChart3, TrendingUp, Users, Calendar, DollarSign, Clock } from "lucide-react";

interface Report {
  id: number;
  name: string;
  type: string;
  size: string;
  download_url: string;
  created_at: string;
}

export function ReportsContent() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch("/api/reports");
      const data = await res.json();
      if (data.success) setReports(data.data);
      else setReports([]);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading reports...</div>;
  if (!reports.length) return <div className="p-6 text-center">No reports found</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Reports & Analytics</h1>

      <div className="space-y-3">
        {reports.map((report) => (
          <div
            key={report.id}
            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <FileText className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{report.name}</h4>
                <p className="text-sm text-gray-500">
                  {new Date(report.created_at).toLocaleDateString()} • {report.type} • {report.size}
                </p>
              </div>
            </div>
            <a
              href={report.download_url}
              download
              className="flex items-center gap-2 px-3 py-1 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              Download
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
