import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { it, enUS, es, fr, de, Locale } from "date-fns/locale";

const dateLocales: Record<string, Locale> = { it, en: enUS, es, fr, de };

interface Client {
  id: string;
  name: string;
  color: string;
  hourly_rate?: number | null;
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
  language?: string;
}

// Brand colors
const COLORS = {
  primary: [99, 102, 241] as [number, number, number],      // Indigo-500
  primaryDark: [79, 70, 229] as [number, number, number],   // Indigo-600
  secondary: [168, 85, 247] as [number, number, number],    // Purple-500
  dark: [17, 24, 39] as [number, number, number],           // Gray-900
  gray: [107, 114, 128] as [number, number, number],        // Gray-500
  lightGray: [243, 244, 246] as [number, number, number],   // Gray-100
  white: [255, 255, 255] as [number, number, number],
  success: [16, 185, 129] as [number, number, number],      // Emerald-500
};

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

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [99, 102, 241];
}

export function exportToCSV(data: ExportData): void {
  const { entries, clients, dateRange, userName, selectedClientId, language = "it" } = data;
  const locale = dateLocales[language] || it;
  
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
      format(entryDate, "EEEE", { locale }),
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
  const { entries, clients, dateRange, userName, logoUrl, selectedClientId, language = "it" } = data;
  const locale = dateLocales[language] || it;
  
  const getClientName = (clientId: string | null) => 
    clients.find(c => c.id === clientId)?.name || "Senza cliente";

  const getClientColor = (clientId: string | null): [number, number, number] => {
    const client = clients.find(c => c.id === clientId);
    return client?.color ? hexToRgb(client.color) : COLORS.gray;
  };

  const filteredEntries = selectedClientId && selectedClientId !== "all"
    ? entries.filter(e => e.client_id === selectedClientId)
    : entries;

  const selectedClient = selectedClientId && selectedClientId !== "all"
    ? clients.find(c => c.id === selectedClientId)
    : null;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPos = margin;

  // ============ HEADER SECTION ============
  
  // Header background gradient effect (simulated with rectangles)
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 50, "F");
  
  // Add subtle gradient overlay
  doc.setFillColor(...COLORS.primaryDark);
  doc.rect(0, 0, pageWidth * 0.6, 50, "F");

  // Logo
  let logoLoaded = false;
  if (logoUrl) {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject();
        img.src = logoUrl;
      });
      
      const maxWidth = 35;
      const maxHeight = 18;
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
      
      // Add white background for logo
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(margin - 2, 8, width + 4, height + 4, 2, 2, "F");
      doc.addImage(img, "PNG", margin, 10, width, height);
      logoLoaded = true;
    } catch {
      // Logo failed to load
    }
  }

  // Title
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  const titleX = logoLoaded ? margin + 50 : margin;
  doc.text("TIMESHEET", titleX, 25);
  
  // Subtitle
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(userName, titleX, 33);
  
  // Period badge on right
  doc.setFillColor(...COLORS.white);
  const periodText = `${format(dateRange.start, "d MMM", { locale })} - ${format(dateRange.end, "d MMM yyyy", { locale })}`;
  const periodWidth = doc.getTextWidth(periodText) + 12;
  doc.roundedRect(pageWidth - margin - periodWidth, 18, periodWidth, 14, 3, 3, "F");
  doc.setTextColor(...COLORS.primaryDark);
  doc.setFontSize(9);
  doc.text(periodText, pageWidth - margin - periodWidth + 6, 27);

  yPos = 60;

  // ============ STATS CARDS ============
  
  const totalSeconds = filteredEntries.reduce((acc, e) => acc + (e.duration_seconds || 0), 0);
  const totalHours = totalSeconds / 3600;
  const uniqueDays = new Set(filteredEntries.map(e => e.date)).size;
  const avgPerDay = uniqueDays > 0 ? totalHours / uniqueDays : 0;

  // Stats container
  const statsY = yPos;
  const cardWidth = (pageWidth - margin * 2 - 10) / 3;
  const cardHeight = 28;

  // Card 1: Total Hours
  doc.setFillColor(...COLORS.lightGray);
  doc.roundedRect(margin, statsY, cardWidth, cardHeight, 3, 3, "F");
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(margin, statsY, 4, cardHeight, 2, 0, "F");
  doc.setTextColor(...COLORS.gray);
  doc.setFontSize(8);
  doc.text("ORE TOTALI", margin + 10, statsY + 10);
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(formatDuration(totalSeconds), margin + 10, statsY + 22);

  // Card 2: Entries
  const card2X = margin + cardWidth + 5;
  doc.setFillColor(...COLORS.lightGray);
  doc.roundedRect(card2X, statsY, cardWidth, cardHeight, 3, 3, "F");
  doc.setFillColor(...COLORS.secondary);
  doc.roundedRect(card2X, statsY, 4, cardHeight, 2, 0, "F");
  doc.setTextColor(...COLORS.gray);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("REGISTRAZIONI", card2X + 10, statsY + 10);
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(String(filteredEntries.length), card2X + 10, statsY + 22);

  // Card 3: Avg per day
  const card3X = margin + (cardWidth + 5) * 2;
  doc.setFillColor(...COLORS.lightGray);
  doc.roundedRect(card3X, statsY, cardWidth, cardHeight, 3, 3, "F");
  doc.setFillColor(...COLORS.success);
  doc.roundedRect(card3X, statsY, 4, cardHeight, 2, 0, "F");
  doc.setTextColor(...COLORS.gray);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("MEDIA/GIORNO", card3X + 10, statsY + 10);
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`${avgPerDay.toFixed(1)}h`, card3X + 10, statsY + 22);

  yPos = statsY + cardHeight + 15;

  // Client filter info
  if (selectedClient) {
    const clientColor = hexToRgb(selectedClient.color);
    doc.setFillColor(...clientColor);
    doc.roundedRect(margin, yPos, 8, 8, 2, 2, "F");
    doc.setTextColor(...COLORS.dark);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`Cliente: ${selectedClient.name}`, margin + 12, yPos + 6);
    yPos += 15;
  }

  // ============ MAIN TABLE ============
  
  // Group entries by date
  const entriesByDate: Record<string, TimeEntry[]> = {};
  filteredEntries.forEach(entry => {
    if (!entriesByDate[entry.date]) entriesByDate[entry.date] = [];
    entriesByDate[entry.date].push(entry);
  });

  const sortedDates = Object.keys(entriesByDate).sort((a, b) => a.localeCompare(b));

  // Build table data with date grouping
  const tableData: any[][] = [];
  sortedDates.forEach(dateKey => {
    const dayEntries = entriesByDate[dateKey];
    const entryDate = new Date(dateKey);
    const dayTotal = dayEntries.reduce((acc, e) => acc + (e.duration_seconds || 0), 0);
    
    // Date header row
    tableData.push([
      {
        content: `${format(entryDate, "EEEE d MMMM", { locale })}`,
        colSpan: 4,
        styles: { 
          fillColor: COLORS.lightGray,
          textColor: COLORS.dark,
          fontStyle: "bold",
          fontSize: 9,
        }
      },
      {
        content: formatDuration(dayTotal),
        styles: {
          fillColor: COLORS.lightGray,
          textColor: COLORS.primary,
          fontStyle: "bold",
          halign: "right",
          fontSize: 9,
        }
      }
    ]);

    // Entry rows
    dayEntries.forEach(entry => {
      tableData.push([
        {
          content: "",
          styles: { cellWidth: 3, fillColor: getClientColor(entry.client_id) }
        },
        getClientName(entry.client_id),
        entry.description || "-",
        `${formatTimeOfDay(entry.start_time)}${entry.end_time ? ` - ${formatTimeOfDay(entry.end_time)}` : ""}`,
        formatDuration(entry.duration_seconds || 0),
      ]);
    });
  });

  // Table
  autoTable(doc, {
    startY: yPos,
    head: [[
      { content: "", styles: { cellWidth: 3 } },
      "Cliente",
      "Descrizione", 
      "Orario",
      "Durata"
    ]],
    body: tableData,
    foot: [[
      { content: "", styles: { cellWidth: 3, fillColor: COLORS.primary } },
      { content: "", colSpan: 2 },
      { content: "TOTALE", styles: { fontStyle: "bold", halign: "right" } },
      { content: formatDuration(totalSeconds), styles: { fontStyle: "bold", textColor: COLORS.primary } }
    ]],
    theme: "plain",
    headStyles: {
      fillColor: COLORS.dark,
      textColor: COLORS.white,
      fontStyle: "bold",
      fontSize: 8,
      cellPadding: 4,
    },
    footStyles: {
      fillColor: COLORS.lightGray,
      textColor: COLORS.dark,
      fontStyle: "bold",
      fontSize: 9,
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
      lineColor: [229, 231, 235],
      lineWidth: 0.1,
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
    columnStyles: {
      0: { cellWidth: 3 },
      1: { cellWidth: 40 },
      2: { cellWidth: 70 },
      3: { cellWidth: 35 },
      4: { cellWidth: 25, halign: "right" },
    },
    margin: { left: margin, right: margin },
    didDrawPage: (data) => {
      // Footer on each page
      doc.setFillColor(...COLORS.lightGray);
      doc.rect(0, pageHeight - 12, pageWidth, 12, "F");
      
      doc.setTextColor(...COLORS.gray);
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      
      const footerText = `Generato il ${format(new Date(), "d MMMM yyyy 'alle' HH:mm", { locale })}`;
      doc.text(footerText, margin, pageHeight - 5);
      
      const pageText = `Pagina ${data.pageNumber}`;
      doc.text(pageText, pageWidth - margin - doc.getTextWidth(pageText), pageHeight - 5);
    },
  });

  // ============ CLIENT SUMMARY (if showing all) ============
  
  if (!selectedClient && clients.length > 0) {
    const finalY = (doc as any).lastAutoTable?.finalY || yPos + 50;
    
    // Check if we have enough space, otherwise add new page
    if (finalY > pageHeight - 80) {
      doc.addPage();
      yPos = margin;
    } else {
      yPos = finalY + 12;
    }

    // Section title
    doc.setFillColor(...COLORS.secondary);
    doc.roundedRect(margin, yPos, 4, 16, 1, 1, "F");
    doc.setTextColor(...COLORS.dark);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Riepilogo per Cliente", margin + 10, yPos + 11);
    yPos += 22;

    const clientSummary = clients
      .map(client => {
        const clientTotal = filteredEntries
          .filter(e => e.client_id === client.id)
          .reduce((acc, e) => acc + (e.duration_seconds || 0), 0);
        const percentage = totalSeconds > 0 ? (clientTotal / totalSeconds) * 100 : 0;
        return { 
          name: client.name, 
          color: hexToRgb(client.color),
          total: clientTotal,
          percentage 
        };
      })
      .filter(c => c.total > 0)
      .sort((a, b) => b.total - a.total);

    // Client summary with visual bars
    autoTable(doc, {
      startY: yPos,
      head: [[
        { content: "", styles: { cellWidth: 4 } },
        "Cliente",
        "Ore",
        "Percentuale",
        ""
      ]],
      body: clientSummary.map(c => [
        { content: "", styles: { fillColor: c.color, cellWidth: 4 } },
        c.name,
        formatDuration(c.total),
        `${c.percentage.toFixed(1)}%`,
        { 
          content: "", 
          styles: { 
            fillColor: COLORS.lightGray,
            cellPadding: { top: 8, bottom: 8, left: 0, right: 0 }
          }
        }
      ]),
      theme: "plain",
      headStyles: {
        fillColor: COLORS.lightGray,
        textColor: COLORS.dark,
        fontStyle: "bold",
        fontSize: 8,
      },
      styles: {
        fontSize: 9,
        cellPadding: 4,
      },
      columnStyles: {
        0: { cellWidth: 4 },
        1: { cellWidth: 60 },
        2: { cellWidth: 30, halign: "right" },
        3: { cellWidth: 25, halign: "right" },
        4: { cellWidth: 50 },
      },
      margin: { left: margin, right: margin },
      didDrawCell: (data) => {
        // Draw percentage bar in last column
        if (data.section === "body" && data.column.index === 4) {
          const client = clientSummary[data.row.index];
          if (client) {
            const barWidth = (data.cell.width - 4) * (client.percentage / 100);
            doc.setFillColor(...client.color);
            doc.roundedRect(
              data.cell.x + 2,
              data.cell.y + data.cell.height / 2 - 3,
              barWidth,
              6,
              1, 1, "F"
            );
          }
        }
      }
    });
  }

  // ============ SAVE PDF ============
  
  const fileName = selectedClient 
    ? `timesheet_${selectedClient.name.toLowerCase().replace(/\s+/g, "_")}_${format(dateRange.start, "yyyy-MM-dd")}.pdf`
    : `timesheet_${format(dateRange.start, "yyyy-MM-dd")}_${format(dateRange.end, "yyyy-MM-dd")}.pdf`;
  
  doc.save(fileName);
}
