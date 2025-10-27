import React, { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const FormToPDF = () => {
  const [formData, setFormData] = useState({
    date: "",
    type: "",
    persons: [],
    otherPerson: "",
    title: "",
    message: "",
  });

  const [submissions, setSubmissions] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePersonChange = (e) => {
    const { options } = e.target;
    const selected = [];
    for (const opt of options) {
      if (opt.selected) selected.push(opt.value);
    }
    setFormData({ ...formData, persons: selected });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Format the date like "27 October 2025"
    const dateObj = new Date(formData.date);
    const formattedDate = dateObj.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    // Prepare final person list (include "other" if applicable)
    const personsList = [...formData.persons];
    if (
      formData.persons.includes("Other") &&
      formData.otherPerson.trim() !== ""
    ) {
      personsList.push(formData.otherPerson);
    }

    const entry = {
      date: formattedDate,
      type: formData.type,
      persons: personsList,
      title: formData.title,
      message: formData.message,
    };

    setSubmissions((prev) => [...prev, entry]);

    // Reset form
    setFormData({
      date: "",
      type: "",
      persons: [],
      otherPerson: "",
      title: "",
      message: "",
    });
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Form Submissions Report", 14, 20);

    const tableColumn = ["#", "Date", "Type", "Persons", "Title", "Message"];
    const tableRows = submissions.map((sub, i) => [
      i + 1,
      sub.date,
      sub.type,
      sub.persons.join("\n"), // show persons on new lines
      sub.title,
      sub.message,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: { valign: "middle" },
      theme: "striped",
    });

    const now = new Date();
    const footer = `Generated on: ${now.toLocaleString()}`;
    doc.setFontSize(10);
    doc.text(footer, 14, doc.internal.pageSize.height - 10);

    doc.save("form-submissions.pdf");
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <h4 className="text-center mb-4 text-primary">
                Form to PDF Report
              </h4>

              <form onSubmit={handleSubmit}>
                {/* Date */}
                <div className="mb-3">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    name="date"
                    className="form-control"
                    required
                    value={formData.date}
                    onChange={handleChange}
                  />
                </div>

                {/* Type */}
                <div className="mb-3">
                  <label className="form-label">Type</label>
                  <select
                    name="type"
                    className="form-select"
                    required
                    value={formData.type}
                    onChange={handleChange}
                  >
                    <option value="">Select type</option>
                    <option value="Live">Live</option>
                    <option value="Video">Video</option>
                  </select>
                </div>

                {/* Persons */}
                <div className="mb-3">
                  <label className="form-label">Person(s)</label>
                  <select
                    multiple
                    name="persons"
                    className="form-select"
                    required
                    value={formData.persons}
                    onChange={handlePersonChange}
                  >
                    <option value="Mr A">Mr A</option>
                    <option value="Mr B">Mr B</option>
                    <option value="Mr C">Mr C</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Other Person (conditional) */}
                {formData.persons.includes("Other") && (
                  <div className="mb-3">
                    <label className="form-label">Enter Other Name</label>
                    <input
                      type="text"
                      name="otherPerson"
                      className="form-control"
                      value={formData.otherPerson}
                      onChange={handleChange}
                      placeholder="Enter name"
                    />
                  </div>
                )}

                {/* Title */}
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    name="title"
                    className="form-control"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter title"
                  />
                </div>

                {/* Message */}
                <div className="mb-3">
                  <label className="form-label">Message</label>
                  <textarea
                    name="message"
                    className="form-control"
                    rows="3"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Type message"
                  ></textarea>
                </div>

                <div className="d-grid">
                  <button type="submit" className="btn btn-success">
                    Add Entry
                  </button>
                </div>
              </form>

              {submissions.length > 0 && (
                <>
                  <h5 className="mt-4 text-center">Entries</h5>
                  <table className="table table-bordered table-striped mt-3">
                    <thead className="table-primary">
                      <tr>
                        <th>#</th>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Persons</th>
                        <th>Title</th>
                        <th>Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((s, i) => (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td>{s.date}</td>
                          <td>{s.type}</td>
                          <td>
                            {s.persons.map((p, idx) => (
                              <div key={idx}>{p}</div>
                            ))}
                          </td>
                          <td>{s.title}</td>
                          <td>{s.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="d-grid">
                    <button
                      className="btn btn-primary"
                      onClick={handleDownloadPDF}
                    >
                      Download PDF
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <footer className="text-center mt-3 text-muted">
            <small>React + Vite + Bootstrap + jsPDF</small>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default FormToPDF;
