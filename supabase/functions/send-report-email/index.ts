import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { jsPDF } from "https://esm.sh/jspdf@2.5.1";
import autoTable from "https://esm.sh/jspdf-autotable@3.8.2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TimeEntry {
  id: string;
  client_id: string | null;
  task_id: string | null;
  description: string | null;
  duration_seconds: number | null;
  date: string;
}

interface Client {
  id: string;
  name: string;
  color: string;
  hourly_rate: number | null;
}

interface Task {
  id: string;
  title: string;
}

interface ReportEmailRequest {
  recipientEmail: string;
  recipientName?: string;
  subject?: string;
  dateFrom: string;
  dateTo: string;
  clientId?: string;
  taskIds?: string[];
  includePdf?: boolean;
  pdfLayout?: string[];
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function formatDatePdf(dateStr: string): string {
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, '0');
  const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

function formatDateEmail(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Premium color palette
const COLORS = {
  primary: [99, 102, 241] as [number, number, number],
  primaryLight: [238, 242, 255] as [number, number, number],
  secondary: [139, 92, 246] as [number, number, number],
  accent: [245, 158, 11] as [number, number, number],
  accentLight: [254, 243, 226] as [number, number, number],
  success: [16, 185, 129] as [number, number, number],
  successLight: [236, 253, 245] as [number, number, number],
  dark: [15, 23, 42] as [number, number, number],
  gray: [100, 116, 139] as [number, number, number],
  grayLight: [248, 250, 252] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  border: [226, 232, 240] as [number, number, number],
};

async function loadImageAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binary);
  } catch (error) {
    console.error("Error loading image:", error);
    return null;
  }
}

function renderPremiumHeader(
  doc: jsPDF, 
  dateFrom: string, 
  dateTo: string, 
  selectedClientName?: string,
  selectedTasks?: string[],
  logoBase64?: string | null
): number {
  const pageWidth = doc.internal.pageSize.width;
  const centerX = pageWidth / 2;
  
  // Gradient header background - adapts to page width
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 55, 'F');
  
  // Subtle secondary gradient overlay
  doc.setFillColor(...COLORS.secondary);
  doc.setGState(new (doc as any).GState({ opacity: 0.3 }));
  doc.rect(centerX, 0, centerX, 55, 'F');
  doc.setGState(new (doc as any).GState({ opacity: 1 }));
  
  // Logo on the left if available
  let titleX = centerX;
  if (logoBase64) {
    try {
      // Add white rounded background for logo
      doc.setFillColor(...COLORS.white);
      doc.roundedRect(15, 10, 40, 35, 3, 3, 'F');
      
      // Add logo image
      doc.addImage(`data:image/png;base64,${logoBase64}`, 'PNG', 18, 13, 34, 29);
      
      // Shift title slightly to the right to balance
      titleX = (pageWidth + 50) / 2;
    } catch (e) {
      console.error("Error adding logo to PDF:", e);
    }
  }
  
  // Title
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("REPORT ORE", titleX, 25, { align: "center" });
  
  // Date range with elegant styling
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`${formatDatePdf(dateFrom)} - ${formatDatePdf(dateTo)}`, titleX, 36, { align: "center" });
  
  // Client name if selected
  if (selectedClientName) {
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255, 0.9);
    doc.text(`Cliente: ${selectedClientName}`, titleX, 47, { align: "center" });
  }

  return 65;
}

function renderSummaryCards(
  doc: jsPDF, 
  yPos: number, 
  totalSeconds: number, 
  totalValue: number,
  entriesCount: number
): number {
  const pageHeight = doc.internal.pageSize.height;
  if (yPos > pageHeight - 60) {
    doc.addPage();
    yPos = 25;
  }
  
  const cardWidth = 55;
  const cardHeight = 40;
  const startX = 20;
  const gap = 5;
  
  // Card 1: Total Hours
  doc.setFillColor(...COLORS.primaryLight);
  doc.roundedRect(startX, yPos, cardWidth, cardHeight, 4, 4, 'F');
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(startX, yPos, 4, cardHeight, 2, 0, 'F');
  
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.primary);
  doc.text(formatDuration(totalSeconds), startX + 12, yPos + 20);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.gray);
  doc.text("Ore Totali", startX + 12, yPos + 32);
  
  // Card 2: Total Value
  doc.setFillColor(...COLORS.accentLight);
  doc.roundedRect(startX + cardWidth + gap, yPos, cardWidth, cardHeight, 4, 4, 'F');
  doc.setFillColor(...COLORS.accent);
  doc.roundedRect(startX + cardWidth + gap, yPos, 4, cardHeight, 2, 0, 'F');
  
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.accent);
  doc.text(`€${totalValue.toFixed(0)}`, startX + cardWidth + gap + 12, yPos + 20);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.gray);
  doc.text("Valore Totale", startX + cardWidth + gap + 12, yPos + 32);
  
  // Card 3: Entries count
  doc.setFillColor(...COLORS.successLight);
  doc.roundedRect(startX + (cardWidth + gap) * 2, yPos, cardWidth, cardHeight, 4, 4, 'F');
  doc.setFillColor(...COLORS.success);
  doc.roundedRect(startX + (cardWidth + gap) * 2, yPos, 4, cardHeight, 2, 0, 'F');
  
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.success);
  doc.text(`${entriesCount}`, startX + (cardWidth + gap) * 2 + 12, yPos + 20);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.gray);
  doc.text("Attivita", startX + (cardWidth + gap) * 2 + 12, yPos + 32);
  
  return yPos + cardHeight + 15;
}

function renderClientBreakdown(
  doc: jsPDF, 
  yPos: number, 
  clientTotals: Record<string, { name: string; color: string; seconds: number; value: number }>,
  totalSeconds: number,
  totalValue: number
): number {
  const pageHeight = doc.internal.pageSize.height;
  if (yPos > pageHeight - 80) {
    doc.addPage();
    yPos = 25;
  }
  
  // Section title with accent bar
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(20, yPos, 4, 16, 2, 2, 'F');
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Riepilogo per Cliente", 30, yPos + 11);
  
  yPos += 25;
  
  const clientTableData = Object.values(clientTotals)
    .sort((a, b) => b.seconds - a.seconds)
    .map(c => {
      const percentage = totalSeconds > 0 ? Math.round((c.seconds / totalSeconds) * 100) : 0;
      return [c.name, formatDuration(c.seconds), `${percentage}%`, `€${c.value.toFixed(2)}`];
    });
  
  clientTableData.push(["TOTALE", formatDuration(totalSeconds), "100%", `€${totalValue.toFixed(2)}`]);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Cliente', 'Ore', '%', 'Valore']],
    body: clientTableData,
    theme: 'plain',
    headStyles: {
      fillColor: COLORS.grayLight,
      textColor: COLORS.gray,
      fontStyle: 'bold',
      fontSize: 9,
      cellPadding: 6,
    },
    bodyStyles: {
      fontSize: 10,
      cellPadding: 5,
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 35, halign: 'right' },
      2: { cellWidth: 25, halign: 'center' },
      3: { cellWidth: 40, halign: 'right' },
    },
    alternateRowStyles: {
      fillColor: [252, 252, 253],
    },
    didParseCell: function(data: any) {
      if (data.row.index === clientTableData.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = COLORS.primaryLight;
        data.cell.styles.textColor = COLORS.primary;
      }
    },
    margin: { left: 20, right: 20 },
  });
  
  return (doc as any).lastAutoTable.finalY + 20;
}

function renderDailyDetails(
  doc: jsPDF,
  yPos: number,
  timeEntries: TimeEntry[],
  clientsMap: Record<string, Client>,
  tasksMap: Record<string, Task>
): number {
  const pageWidth = doc.internal.pageSize.width;
  const isLandscape = pageWidth > 250;
  
  if (yPos > (isLandscape ? 140 : 200)) {
    doc.addPage();
    yPos = 25;
  }
  
  // Section title with accent bar
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(20, yPos, 4, 16, 2, 2, 'F');
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Dettaglio Attivita", 30, yPos + 11);
  
  yPos += 25;
  
  // Group entries by date
  const entriesByDate: Record<string, TimeEntry[]> = {};
  timeEntries
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .forEach(entry => {
      if (!entriesByDate[entry.date]) {
        entriesByDate[entry.date] = [];
      }
      entriesByDate[entry.date].push(entry);
    });
  
  const tableData: (string | { content: string; styles?: any })[][] = [];
  
  Object.entries(entriesByDate).forEach(([date, entries]) => {
    const dayTotalSeconds = entries.reduce((acc, e) => acc + (e.duration_seconds || 0), 0);
    
    // Date row header - clean date without ">"
    tableData.push([
      { content: formatDatePdf(date), styles: { fontStyle: 'bold', fillColor: COLORS.primaryLight, textColor: COLORS.primary, fontSize: 10 } },
      { content: '', styles: { fillColor: COLORS.primaryLight } },
      { content: '', styles: { fillColor: COLORS.primaryLight } },
      { content: '', styles: { fillColor: COLORS.primaryLight } },
      { content: '', styles: { fillColor: COLORS.primaryLight } }
    ]);
    
    entries.forEach(entry => {
      const client = entry.client_id ? clientsMap[entry.client_id] : null;
      const task = entry.task_id ? tasksMap[entry.task_id] : null;
      const clientName = client?.name || "-";
      const taskName = task?.title || "-";
      const description = entry.description || "-";
      
      tableData.push([
        '',
        clientName,
        taskName,
        description,
        formatDuration(entry.duration_seconds || 0)
      ]);
    });
    
    // Subtotal row
    tableData.push([
      { content: '', styles: { fillColor: COLORS.grayLight } },
      { content: '', styles: { fillColor: COLORS.grayLight } },
      { content: '', styles: { fillColor: COLORS.grayLight } },
      { content: 'Subtotale', styles: { fontStyle: 'bold', halign: 'right', fillColor: COLORS.grayLight, fontSize: 9 } },
      { content: formatDuration(dayTotalSeconds), styles: { fontStyle: 'bold', halign: 'right', fillColor: COLORS.grayLight } }
    ]);
  });
  
  // Landscape layout - more space for description
  autoTable(doc, {
    startY: yPos,
    head: [['Data', 'Cliente', 'Task', 'Descrizione', 'Durata']],
    body: tableData,
    theme: 'plain',
    headStyles: {
      fillColor: COLORS.primary,
      textColor: COLORS.white,
      fontStyle: 'bold',
      fontSize: 9,
      cellPadding: 5,
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: 4,
    },
    columnStyles: isLandscape ? {
      0: { cellWidth: 35 },
      1: { cellWidth: 40 },
      2: { cellWidth: 50 },
      3: { cellWidth: 'auto' }, // Description takes remaining space
      4: { cellWidth: 25, halign: 'right' },
    } : {
      0: { cellWidth: 32 },
      1: { cellWidth: 32 },
      2: { cellWidth: 35 },
      3: { cellWidth: 'auto' },
      4: { cellWidth: 22, halign: 'right' },
    },
    didParseCell: function(data: any) {
      if (data.section === 'body') {
        data.cell.styles.lineWidth = 0.1;
        data.cell.styles.lineColor = COLORS.border;
      }
    },
    margin: { left: 20, right: 20 },
    tableWidth: 'auto',
  });
  
  return (doc as any).lastAutoTable.finalY;
}

function renderFooter(doc: jsPDF): void {
  const pageCount = doc.getNumberOfPages();
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    
    // Footer line
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.5);
    doc.line(20, pageHeight - 18, pageWidth - 20, pageHeight - 18);
    
    // Footer text
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.gray);
    doc.setFont("helvetica", "normal");
    doc.text("Report generato con Tempora", 20, pageHeight - 10);
    doc.text(`Pagina ${i} di ${pageCount}`, pageWidth - 20, pageHeight - 10, { align: "right" });
  }
}

function generatePdf(
  senderName: string,
  recipientName: string | undefined,
  dateFrom: string,
  dateTo: string,
  clientTotals: Record<string, { name: string; color: string; seconds: number; value: number }>,
  totalSeconds: number,
  totalValue: number,
  timeEntries: TimeEntry[],
  clientsMap: Record<string, Client>,
  tasksMap: Record<string, Task>,
  selectedClientName?: string,
  selectedTaskNames?: string[],
  pdfLayout?: string[],
  logoBase64?: string | null
): string {
  // Start with PORTRAIT orientation for first page (summary + client breakdown)
  const doc = new jsPDF({ orientation: 'portrait' });
  
  const layout = pdfLayout && pdfLayout.length > 0 
    ? pdfLayout 
    : ["summary", "clientBreakdown", "dailyDetails"];
  
  // Premium Header with logo
  let yPos = renderPremiumHeader(doc, dateFrom, dateTo, selectedClientName, selectedTaskNames, logoBase64);
  
  // Greeting
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  const greeting = recipientName ? `Ciao ${recipientName},` : 'Ciao,';
  doc.text(greeting, 20, yPos);
  yPos += 6;
  doc.text(`ecco il riepilogo delle ore lavorate inviato da ${senderName}.`, 20, yPos);
  
  // Selected tasks info
  if (selectedTaskNames && selectedTaskNames.length > 0) {
    yPos += 8;
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.gray);
    const tasksList = selectedTaskNames.length > 3 
      ? `${selectedTaskNames.slice(0, 3).join(", ")} (+${selectedTaskNames.length - 3} altri)`
      : selectedTaskNames.join(", ");
    doc.text(`Task selezionati: ${tasksList}`, 20, yPos);
  }
  
  yPos += 15;
  
  // Render summary and client breakdown on first page (portrait)
  for (const section of layout) {
    if (section === "summary") {
      yPos = renderSummaryCards(doc, yPos, totalSeconds, totalValue, timeEntries.length);
    } else if (section === "clientBreakdown") {
      yPos = renderClientBreakdown(doc, yPos, clientTotals, totalSeconds, totalValue);
    }
  }
  
  // Add new page in LANDSCAPE for daily details
  if (layout.includes("dailyDetails") && timeEntries.length > 0) {
    doc.addPage('a4', 'landscape');
    yPos = 25;
    renderDailyDetails(doc, yPos, timeEntries, clientsMap, tasksMap);
  }
  
  // Footer on all pages
  renderFooter(doc);
  
  return doc.output('datauristring').split(',')[1];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non autorizzato" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Non autorizzato" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { recipientEmail, recipientName, subject, dateFrom, dateTo, clientId, taskIds, includePdf, pdfLayout }: ReportEmailRequest = await req.json();

    if (!recipientEmail || !dateFrom || !dateTo) {
      return new Response(JSON.stringify({ error: "Parametri mancanti" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Fetch profile, clients, and tasks
    const [profileRes, clientsRes, tasksRes] = await Promise.all([
      supabase.from("profiles").select("name, logo_url").eq("user_id", user.id).single(),
      supabase.from("clients").select("*").eq("user_id", user.id),
      supabase.from("tasks").select("id, title").eq("user_id", user.id),
    ]);

    const profile = profileRes.data;
    
    // Load logo if available
    let logoBase64: string | null = null;
    if (profile?.logo_url) {
      logoBase64 = await loadImageAsBase64(profile.logo_url);
    }
    const clients = clientsRes.data || [];
    const tasks = tasksRes.data || [];

    // Build entries query
    let entriesQuery = supabase
      .from("time_entries")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", dateFrom)
      .lte("date", dateTo)
      .order("date", { ascending: true });

    if (clientId) {
      entriesQuery = entriesQuery.eq("client_id", clientId);
    }

    if (taskIds && taskIds.length > 0) {
      entriesQuery = entriesQuery.in("task_id", taskIds);
    }

    const { data: entries } = await entriesQuery;

    const timeEntries: TimeEntry[] = entries || [];
    
    // Create lookup maps
    const clientsMap: Record<string, Client> = {};
    clients.forEach(c => { clientsMap[c.id] = c; });
    
    const tasksMap: Record<string, Task> = {};
    tasks.forEach(t => { tasksMap[t.id] = t; });

    // Calculate totals
    const totalSeconds = timeEntries.reduce((acc, e) => acc + (e.duration_seconds || 0), 0);
    
    const clientTotals: Record<string, { name: string; color: string; seconds: number; value: number }> = {};
    timeEntries.forEach(entry => {
      const client = entry.client_id ? clientsMap[entry.client_id] : null;
      const clientName = client?.name || "Senza cliente";
      const clientColor = client?.color || "#94a3b8";
      const hourlyRate = client?.hourly_rate || 0;
      
      if (!clientTotals[clientName]) {
        clientTotals[clientName] = { name: clientName, color: clientColor, seconds: 0, value: 0 };
      }
      clientTotals[clientName].seconds += entry.duration_seconds || 0;
      clientTotals[clientName].value += ((entry.duration_seconds || 0) / 3600) * hourlyRate;
    });

    const totalValue = Object.values(clientTotals).reduce((acc, c) => acc + c.value, 0);
    const senderName = profile?.name || user.email?.split("@")[0] || "Utente";
    const selectedClient = clientId ? clientsMap[clientId] : null;
    
    // Get selected task names
    const selectedTaskNames = taskIds?.map(id => tasksMap[id]?.title).filter(Boolean) || [];

    // Build email HTML
    const clientRows = Object.values(clientTotals)
      .sort((a, b) => b.seconds - a.seconds)
      .map(c => `
        <tr>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0;">
            <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background-color: ${c.color}; margin-right: 8px;"></span>
            ${c.name}
          </td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 600;">
            ${formatDuration(c.seconds)}
          </td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; text-align: right;">
            €${c.value.toFixed(2)}
          </td>
        </tr>
      `).join("");

    const pdfNote = includePdf 
      ? `<p style="margin: 16px 0 0 0; padding: 12px; background: #f0f4ff; border-radius: 8px; font-size: 14px; color: #6366f1;">📎 Report PDF allegato a questa email</p>`
      : '';

    const tasksNote = selectedTaskNames.length > 0
      ? `<p style="margin: 8px 0 0 0; font-size: 13px; color: #64748b;">Task: ${selectedTaskNames.join(", ")}</p>`
      : '';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a2e; margin: 0; padding: 0; background-color: #f5f5f7;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">📊 Report Ore</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">
              ${formatDateEmail(dateFrom)} - ${formatDateEmail(dateTo)}
            </p>
            ${selectedClient ? `<p style="color: rgba(255,255,255,0.8); margin: 4px 0 0 0; font-size: 14px;">Cliente: ${selectedClient.name}</p>` : ''}
          </div>
          
          <div style="background: white; padding: 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
            <p style="margin: 0 0 24px 0; color: #64748b;">
              ${recipientName ? `Ciao ${recipientName},` : 'Ciao,'}<br>
              ecco il riepilogo delle ore lavorate inviato da <strong>${senderName}</strong>.
            </p>
            ${tasksNote}
            
            <div style="display: flex; gap: 16px; margin: 24px 0 32px 0;">
              <div style="flex: 1; background: linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%); padding: 20px; border-radius: 12px; text-align: center;">
                <p style="margin: 0; font-size: 28px; font-weight: 700; color: #6366f1;">${formatDuration(totalSeconds)}</p>
                <p style="margin: 4px 0 0 0; font-size: 14px; color: #64748b;">Ore totali</p>
              </div>
              <div style="flex: 1; background: linear-gradient(135deg, #fef3e2 0%, #fef0c7 100%); padding: 20px; border-radius: 12px; text-align: center;">
                <p style="margin: 0; font-size: 28px; font-weight: 700; color: #f59e0b;">€${totalValue.toFixed(0)}</p>
                <p style="margin: 4px 0 0 0; font-size: 14px; color: #64748b;">Valore totale</p>
              </div>
            </div>
            
            <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Dettaglio per cliente</h3>
            <table style="width: 100%; border-collapse: collapse; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
              <thead>
                <tr style="background: #f8fafc;">
                  <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: #64748b; font-size: 14px;">Cliente</th>
                  <th style="padding: 12px 16px; text-align: right; font-weight: 600; color: #64748b; font-size: 14px;">Ore</th>
                  <th style="padding: 12px 16px; text-align: right; font-weight: 600; color: #64748b; font-size: 14px;">Valore</th>
                </tr>
              </thead>
              <tbody>
                ${clientRows}
              </tbody>
              <tfoot>
                <tr style="background: linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%);">
                  <td style="padding: 14px 16px; font-weight: 700;">Totale</td>
                  <td style="padding: 14px 16px; text-align: right; font-weight: 700;">${formatDuration(totalSeconds)}</td>
                  <td style="padding: 14px 16px; text-align: right; font-weight: 700;">€${totalValue.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
            
            ${pdfNote}
            
            <p style="margin: 32px 0 0 0; font-size: 14px; color: #94a3b8; text-align: center;">
              Report generato con ❤️ da Tempora
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailOptions: any = {
      from: "Tempora <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: subject || `Report ore: ${formatDateEmail(dateFrom)} - ${formatDateEmail(dateTo)}`,
      html: emailHtml,
    };

    if (includePdf) {
      try {
        const pdfBase64 = generatePdf(
          senderName,
          recipientName,
          dateFrom,
          dateTo,
          clientTotals,
          totalSeconds,
          totalValue,
          timeEntries,
          clientsMap,
          tasksMap,
          selectedClient?.name,
          selectedTaskNames,
          pdfLayout,
          logoBase64
        );
        
        emailOptions.attachments = [
          {
            filename: `report-ore-${dateFrom}-${dateTo}.pdf`,
            content: pdfBase64,
          },
        ];
      } catch (pdfError) {
        console.error("Error generating PDF:", pdfError);
      }
    }

    const emailResponse = await resend.emails.send(emailOptions);

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, ...emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-report-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
