import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "bootstrap/dist/css/bootstrap.min.css";

const SatsangInfo = () => {
  const [formHeader, setFormHeader] = useState({
    pageTitle: "RADHA SOAMI SATSANG BEAS",
    center: "",
    month: "",
  });

  const [names, setNames] = useState([]);
  const [centers, setCenters] = useState([]);

  const [rows, setRows] = useState([
    { date: "", pathi: [], sksr: [], reserve: [] },
  ]);

  const [newEntries, setNewEntries] = useState({
    pathi: "",
    sksr: "",
    reserve: "",
  });

  // Load JSON data for names and centers
  useEffect(() => {
    fetch("/form-to-pdf/names.json")
      .then((res) => res.json())
      .then(setNames);

    fetch("/form-to-pdf/center-names.json")
      .then((res) => res.json())
      .then(setCenters);
  }, []);

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setFormHeader((prev) => ({ ...prev, [name]: value }));
  };

  const handleRowChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
  };

  const handleSelectChange = (index, field, event) => {
    const values = Array.from(event.target.selectedOptions, (o) => o.value);
    const updatedRows = [...rows];
    updatedRows[index][field] = values;
    setRows(updatedRows);
  };

  const handleAddRow = () => {
    setRows([...rows, { date: "", pathi: [], sksr: [], reserve: [] }]);
  };

  const handleDeleteRow = (index) => {
    const updated = rows.filter((_, i) => i !== index);
    setRows(updated);
  };

  const handleAddOther = (index, field, newValue) => {
    if (!newValue.trim()) return;
    const updatedRows = [...rows];
    updatedRows[index][field].push(newValue);
    setRows(updatedRows);
    setNewEntries((prev) => ({ ...prev, [field]: "" }));
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return isNaN(date)
      ? "-"
      : date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });

    // Title
    doc.setFontSize(18);
    doc.text(formHeader.pageTitle || "Report", 14, 20);

    // Subtitle
    doc.setFontSize(12);
    doc.text(
      `Center: ${formHeader.center || "-"} | Month: ${formHeader.month || "-"}`,
      14,
      28
    );

    // Static time
    const currentTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    doc.text(`Generated on: ${currentTime}`, 230, 28);

    // Table
    const tableColumn = ["Date", "Pathi", "SK/SR/CD", "Reserve"];
    const tableRows = rows.map((r) => [
      formatDate(r.date),
      r.pathi.join("\n"),
      r.sksr.join("\n"),
      r.reserve.join("\n"),
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: "grid",
      styles: { halign: "left", valign: "middle" },
      headStyles: { fillColor: [41, 128, 185] },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 70 },
        2: { cellWidth: 70 },
        3: { cellWidth: 70 },
      },
    });

    doc.save("report.pdf");
  };

  return (
    <div className="container py-5">
      <div className="card shadow p-4">
        <h3 className="text-center mb-4">Schedule Creator</h3>

        {/* Header Fields */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <label className="form-label">Page Title</label>
            <input
              type="text"
              name="pageTitle"
              className="form-control"
              value={formHeader.pageTitle}
              onChange={handleHeaderChange}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Center</label>
            <select
              name="center"
              className="form-select"
              value={formHeader.center}
              onChange={handleHeaderChange}
            >
              <option value="">Select Center</option>
              {centers.map((c, i) => (
                <option key={i} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">Month & Year</label>
            <input
              type="month"
              name="month"
              className="form-control"
              value={formHeader.month}
              onChange={handleHeaderChange}
            />
          </div>
        </div>

        {/* Table Rows Input */}
        {rows.map((row, index) => (
          <div key={index} className="card p-3 mb-3 border shadow-sm">
            <div className="row g-3 align-items-end">
              <div className="col-md-3">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={row.date}
                  onChange={(e) =>
                    handleRowChange(index, "date", e.target.value)
                  }
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Pathi</label>
                <select
                  multiple
                  className="form-select"
                  value={row.pathi}
                  onChange={(e) => handleSelectChange(index, "pathi", e)}
                >
                  {names.map((n, i) => (
                    <option key={i} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <div className="input-group mt-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Other..."
                    value={newEntries.pathi}
                    onChange={(e) =>
                      setNewEntries((p) => ({ ...p, pathi: e.target.value }))
                    }
                  />
                  <button
                    className="btn btn-outline-primary"
                    onClick={() =>
                      handleAddOther(index, "pathi", newEntries.pathi)
                    }
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="col-md-3">
                <label className="form-label">SK/SR/CD</label>
                <select
                  multiple
                  className="form-select"
                  value={row.sksr}
                  onChange={(e) => handleSelectChange(index, "sksr", e)}
                >
                  {names.map((n, i) => (
                    <option key={i} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <div className="input-group mt-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Other..."
                    value={newEntries.sksr}
                    onChange={(e) =>
                      setNewEntries((p) => ({ ...p, sksr: e.target.value }))
                    }
                  />
                  <button
                    className="btn btn-outline-primary"
                    onClick={() =>
                      handleAddOther(index, "sksr", newEntries.sksr)
                    }
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="col-md-3">
                <label className="form-label">Reserve</label>
                <select
                  multiple
                  className="form-select"
                  value={row.reserve}
                  onChange={(e) => handleSelectChange(index, "reserve", e)}
                >
                  {names.map((n, i) => (
                    <option key={i} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <div className="input-group mt-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Other..."
                    value={newEntries.reserve}
                    onChange={(e) =>
                      setNewEntries((p) => ({ ...p, reserve: e.target.value }))
                    }
                  />
                  <button
                    className="btn btn-outline-primary"
                    onClick={() =>
                      handleAddOther(index, "reserve", newEntries.reserve)
                    }
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="col-md-1 text-center">
                <button
                  className="btn btn-danger mt-3"
                  onClick={() => handleDeleteRow(index)}
                >
                  ❌
                </button>
              </div>
            </div>
          </div>
        ))}

        <div className="text-center mb-4">
          <button className="btn btn-outline-secondary" onClick={handleAddRow}>
            ➕ Add Row
          </button>
        </div>

        {/* Preview Table */}
        <h5 className="mb-3">Preview:</h5>
        <div className="table-responsive">
          <table className="table table-bordered text-center align-middle">
            <thead className="table-primary">
              <tr>
                <th>Date</th>
                <th>Pathi</th>
                <th>SK/SR/CD</th>
                <th>Reserve</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td>{formatDate(r.date)}</td>
                  <td>{r.pathi.join(", ") || "-"}</td>
                  <td>{r.sksr.join(", ") || "-"}</td>
                  <td>{r.reserve.join(", ") || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-center mt-4">
          <button className="btn btn-success px-4" onClick={handleDownloadPDF}>
            📄 Generate PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default SatsangInfo;
