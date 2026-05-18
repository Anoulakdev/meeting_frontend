const fs = require('fs');
const file = '/Users/edl07/Desktop/EDL/meeting_notice/frontend/components/users/UserManagement.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Make exportPDF async and add font loading
const pdfFunc = `  const exportPDF = async () => {
    const doc = new jsPDF("landscape");

    try {
      const response = await fetch('/fonts/NotoSansLao-Regular.ttf');
      const buffer = await response.arrayBuffer();
      let binary = '';
      const bytes = new Uint8Array(buffer);
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64String = window.btoa(binary);
      
      doc.addFileToVFS('NotoSansLao-Regular.ttf', base64String);
      doc.addFont('NotoSansLao-Regular.ttf', 'NotoSansLao', 'normal');
      doc.setFont('NotoSansLao');
    } catch(err) {
      console.error("Could not load font", err);
      doc.setFont("helvetica");
    }

    doc.setFontSize(18);
    doc.setTextColor(30, 58, 138);
    doc.text("ລາຍງານຂໍ້ມູນຜູ້ໃຊ້ງານ", 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(\`Generated on: \${new Date().toLocaleString()}\`, 14, 30);

    const tableData = table.getFilteredRowModel().rows.map((row) => {
      const user = row.original;
      return [
        user.name,
        user.empCode,
        user.tel,
        user.department,
        user.division,
        user.position,
        user.role,
        user.status,
      ];
    });

    autoTable(doc, {
      startY: 36,
      head: [["ຊື່ ແລະ ນາມສະກຸນ", "ລະຫັດ", "ເບີໂທ", "ຝ່າຍ", "ພະແນກ", "ຕຳແໜ່ງ", "ສິດຜູ້ໃຊ້", "ສະຖານະ"]],
      body: tableData,
      theme: "grid",
      styles: {
        font: "NotoSansLao",
        cellPadding: 5,
        lineColor: [226, 232, 240],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [30, 58, 138],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: "bold",
        halign: "left",
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [50, 50, 50],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });

    const url = doc.output("bloburl");
    setPdfUrl(url.toString());
    setPdfModalOpen(true);
  };`;
  
content = content.replace(/const exportPDF = \(\) => \{[\s\S]*?setPdfModalOpen\(true\);\n  \};/, pdfFunc);

// 2. Extract unique departments, divisions, positions
const optionsBlock = `
  const getUniqueOptions = (key: keyof User) => {
    const opts = Array.from(new Set(users.map(u => u[key] as string).filter(Boolean)));
    return [{ value: "", label: "All" }, ...opts.map(o => ({ value: o, label: o }))];
  };
`;
// Insert before return (
content = content.replace('  return (\n    <div', optionsBlock + '\n  return (\n    <div');

// 3. Update filters UI
const filtersHTML = `        {/* Filter Panel */}
        {showFilters && (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 px-4 sm:px-6 py-4 border-b"
            style={{ borderColor: "rgb(var(--border))", background: "rgba(var(--brand), 0.03)" }}
          >
            <div>
              <Select
                label="Department"
                value={(table.getColumn("department")?.getFilterValue() as string) ?? ""}
                onChange={(e) => table.getColumn("department")?.setFilterValue(e.target.value)}
                options={getUniqueOptions("department")}
              />
            </div>
            <div>
              <Select
                label="Division"
                value={(table.getColumn("division")?.getFilterValue() as string) ?? ""}
                onChange={(e) => table.getColumn("division")?.setFilterValue(e.target.value)}
                options={getUniqueOptions("division")}
              />
            </div>
            <div>
              <Select
                label="Position"
                value={(table.getColumn("position")?.getFilterValue() as string) ?? ""}
                onChange={(e) => table.getColumn("position")?.setFilterValue(e.target.value)}
                options={getUniqueOptions("position")}
              />
            </div>
            <div>
              <Select
                label="Role"
                value={(table.getColumn("role")?.getFilterValue() as string) ?? ""}
                onChange={(e) => table.getColumn("role")?.setFilterValue(e.target.value)}
                options={[
                  { value: "", label: "All Roles" },
                  { value: "Admin", label: "Admin" },
                  { value: "Manager", label: "Manager" },
                  { value: "Editor", label: "Editor" },
                  { value: "Viewer", label: "Viewer" },
                  { value: "User", label: "User" },
                ]}
              />
            </div>
            <div>
              <Select
                label="Status"
                value={(table.getColumn("status")?.getFilterValue() as string) ?? ""}
                onChange={(e) => table.getColumn("status")?.setFilterValue(e.target.value)}
                options={[
                  { value: "", label: "All Statuses" },
                  { value: "Active", label: "Active" },
                  { value: "Inactive", label: "Inactive" },
                  { value: "Pending", label: "Pending" },
                ]}
              />
            </div>
            <div className="md:col-span-3 lg:col-span-5 flex justify-end">
              <button
                onClick={() => setColumnFilters([])}
                className="text-sm font-medium hover:underline text-brand"
                style={{ color: "rgb(var(--brand))" }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}`;

content = content.replace(/\{\/\* Filter Panel \*\/\}[\s\S]*?\{\/\* Table \*\/\}/, filtersHTML + '\n\n        {/* Table */}');

// 4. Improve Table Header styling
content = content.replace(/<tr key=\{headerGroup\.id\} style=\{\{ background: "rgb\(var\(--bg\)\)" \}\}>/g, '<tr key={headerGroup.id} className="bg-gradient-to-r from-[rgba(var(--brand),0.05)] to-transparent">');

// 5. Improve Button styles
content = content.replace(/<button\s+onClick=\{exportExcel\}[\s\S]*?<Download/g, '<button onClick={exportExcel} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80 shadow-sm border" style={{ background: "rgb(var(--card))", borderColor: "rgb(var(--success))", color: "rgb(var(--success))" }}><Download');

content = content.replace(/<button\s+onClick=\{exportPDF\}[\s\S]*?<Download/g, '<button onClick={exportPDF} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80 shadow-sm border" style={{ background: "rgb(var(--card))", borderColor: "rgb(var(--danger))", color: "rgb(var(--danger))" }}><Download');

fs.writeFileSync(file, content);
console.log("Updated users!");
