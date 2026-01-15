import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface Client {
  id: string;
  name: string;
  color: string;
}

interface TimeEntry {
  id: string;
  client_id: string | null;
  description: string | null;
  duration_seconds: number | null;
  start_time: string;
  end_time: string | null;
  date: string;
  entry_type: string;
}

interface ExportData {
  entries: TimeEntry[];
  clients: Client[];
  dateRange: { start: Date; end: Date };
  userName: string;
  logoUrl?: string | null;
  selectedClientId?: string;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function formatDurationDecimal(seconds: number): string {
  const hours = seconds / 3600;
  return hours.toFixed(2);
}

function formatTimeOfDay(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function exportToCSV(data: ExportData): void {
  const { entries, clients, dateRange, userName, selectedClientId } = data;
  
  const getClientName = (clientId: string | null) => 
    clients.find(c => c.id === clientId)?.name || "Senza cliente";

  const filteredEntries = selectedClientId && selectedClientId !== "all"
    ? entries.filter(e => e.client_id === selectedClientId)
    : entries;

  const headers = ["Data", "Giorno", "Cliente", "Descrizione", "Inizio", "Fine", "Durata", "Ore (decimale)"];
  
  const rows = filteredEntries.map(entry => {
    const entryDate = new Date(entry.date);
    return [
      format(entryDate, "dd/MM/yyyy"),
      format(entryDate, "EEEE", { locale: it }),
      getClientName(entry.client_id),
      entry.description || "",
      formatTimeOfDay(entry.start_time),
      entry.end_time ? formatTimeOfDay(entry.end_time) : "",
      formatDuration(entry.duration_seconds || 0),
      formatDurationDecimal(entry.duration_seconds || 0),
    ];
  });

  // Add totals row
  const totalSeconds = filteredEntries.reduce((acc, e) => acc + (e.duration_seconds || 0), 0);
  rows.push([
    "",
    "",
    "",
    "",
    "",
    "TOTALE",
    formatDuration(totalSeconds),
    formatDurationDecimal(totalSeconds),
  ]);

  const csvContent = [
    `Timesheet - ${userName}`,
    `Periodo: ${format(dateRange.start, "dd/MM/yyyy")} - ${format(dateRange.end, "dd/MM/yyyy")}`,
    "",
    headers.join(";"),
    ...rows.map(row => row.join(";")),
  ].join("\n");

  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `timesheet_${format(dateRange.start, "yyyy-MM-dd")}_${format(dateRange.end, "yyyy-MM-dd")}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function exportToPDF(data: ExportData): Promise<void> {
  const { entries, clients, dateRange, userName, logoUrl, selectedClientId } = data;
  
  const getClientName = (clientId: string | null) => 
    clients.find(c => c.id === clientId)?.name || "Senza cliente";

  const filteredEntries = selectedClientId && selectedClientId !== "all"
    ? entries.filter(e => e.client_id === selectedClientId)
    : entries;

  const selectedClient = selectedClientId && selectedClientId !== "all"
    ? clients.find(c => c.id === selectedClientId)
    : null;

  const doc = new jsPDF();
  let yPos = 20;

  // Load logo if available
  if (logoUrl) {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject();
        img.src = logoUrl;
      });
      
      // Calculate aspect ratio
      const maxWidth = 40;
      const maxHeight = 20;
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      doc.addImage(img, "PNG", 15, yPos, width, height);
      yPos += height + 10;
    } catch {
      // Logo failed to load, continue without it
    }
  }

  // Header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("TIMESHEET", 15, yPos);
  yPos += 10;

  // User info
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(userName, 15, yPos);
  yPos += 8;

  // Date range
  doc.setFontSize(10);
  doc.setTextColor(100);
  const periodText = `Periodo: ${format(dateRange.start, "d MMMM yyyy", { locale: it })} - ${format(dateRange.end, "d MMMM yyyy", { locale: it })}`;
  doc.text(periodText, 15, yPos);
  yPos += 6;

  // Client info if filtered
  if (selectedClient) {
    doc.text(`Cliente: ${selectedClient.name}`, 15, yPos);
    yPos += 6;
  }

  // Generation date
  doc.text(`Generato il: ${format(new Date(), "d MMMM yyyy", { locale: it })}`, 15, yPos);
  yPos += 15;

  // Reset text color
  doc.setTextColor(0);

  // Table data
  const tableData = filteredEntries.map(entry => {
    const entryDate = new Date(entry.date);
    return [
      format(entryDate, "dd/MM/yyyy"),
      format(entryDate, "EEE", { locale: it }),
      getClientName(entry.client_id),
      entry.description || "-",
      `${formatTimeOfDay(entry.start_time)}${entry.end_time ? ` - ${formatTimeOfDay(entry.end_time)}` : ""}`,
      formatDuration(entry.duration_seconds || 0),
    ];
  });

  // Calculate total
  const totalSeconds = filteredEntries.reduce((acc, e) => acc + (e.duration_seconds || 0), 0);

  // Add table
  autoTable(doc, {
    startY: yPos,
    head: [["Data", "Giorno", "Cliente", "Descrizione", "Orario", "Durata"]],
    body: tableData,
    foot: [["", "", "", "", "TOTALE", formatDuration(totalSeconds)]],
    theme: "striped",
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: "bold",
    },
    footStyles: {
      fillColor: [243, 244, 246],
      textColor: 0,
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
    },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 18 },
      2: { cellWidth: 35 },
      3: { cellWidth: 50 },
      4: { cellWidth: 35 },
      5: { cellWidth: 20 },
    },
  });

  // Summary by client (if showing all)
  if (!selectedClient && clients.length > 0) {
    const finalY = (doc as any).lastAutoTable?.finalY || yPos + 50;
    
    if (finalY < 250) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Riepilogo per cliente", 15, finalY + 15);

      const clientSummary = clients
        .map(client => {
          const clientTotal = filteredEntries
            .filter(e => e.client_id === client.id)
            .reduce((acc, e) => acc + (e.duration_seconds || 0), 0);
          return { name: client.name, total: clientTotal };
        })
        .filter(c => c.total > 0);

      autoTable(doc, {
        startY: finalY + 20,
        head: [["Cliente", "Ore totali"]],
        body: clientSummary.map(c => [c.name, formatDuration(c.total)]),
        theme: "plain",
        headStyles: {
          fillColor: [243, 244, 246],
          textColor: 0,
          fontStyle: "bold",
        },
        styles: {
          fontSize: 10,
          cellPadding: 4,
        },
        columnStyles: {
          0: { cellWidth: 100 },
          1: { cellWidth: 40 },
        },
      });
    }
  }

  // Save PDF
  const fileName = selectedClient 
    ? `timesheet_${selectedClient.name.toLowerCase().replace(/\s+/g, "_")}_${format(dateRange.start, "yyyy-MM-dd")}.pdf`
    : `timesheet_${format(dateRange.start, "yyyy-MM-dd")}_${format(dateRange.end, "yyyy-MM-dd")}.pdf`;
  
  doc.save(fileName);
}
