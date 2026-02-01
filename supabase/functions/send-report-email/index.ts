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

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
}

function renderSummarySection(doc: jsPDF, yPos: number, totalSeconds: number, totalValue: number): number {
  if (yPos > 230) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFillColor(240, 244, 255);
  doc.roundedRect(20, yPos, 80, 35, 3, 3, 'F');
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(99, 102, 241);
  doc.text(formatDuration(totalSeconds), 60, yPos + 18, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Ore totali", 60, yPos + 28, { align: "center" });
  
  doc.setFillColor(254, 243, 226);
  doc.roundedRect(110, yPos, 80, 35, 3, 3, 'F');
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(245, 158, 11);
  doc.text(`€${totalValue.toFixed(0)}`, 150, yPos + 18, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Valore totale", 150, yPos + 28, { align: "center" });
  
  return yPos + 50;
}

function renderClientBreakdownSection(
  doc: jsPDF, 
  yPos: number, 
  clientTotals: Record<string, { name: string; color: string; seconds: number; value: number }>,
  totalSeconds: number,
  totalValue: number
): number {
  if (yPos > 220) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Riepilogo per cliente", 20, yPos);
  
  yPos += 8;
  
  const clientTableData = Object.values(clientTotals)
    .sort((a, b) => b.seconds - a.seconds)
    .map(c => [c.name, formatDuration(c.seconds), `€${c.value.toFixed(2)}`]);
  
  clientTableData.push(["Totale", formatDuration(totalSeconds), `€${totalValue.toFixed(2)}`]);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Cliente', 'Ore', 'Valore']],
    body: clientTableData,
    theme: 'grid',
    headStyles: {
      fillColor: [248, 250, 252],
      textColor: [100, 116, 139],
      fontStyle: 'bold',
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 10,
    },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 45, halign: 'right' },
      2: { cellWidth: 45, halign: 'right' },
    },
    didParseCell: function(data: any) {
      if (data.row.index === clientTableData.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [240, 244, 255];
      }
    },
  });
  
  return (doc as any).lastAutoTable.finalY + 15;
}

function renderDailyDetailsSection(
  doc: jsPDF,
  yPos: number,
  timeEntries: TimeEntry[],
  clientsMap: Record<string, Client>
): number {
  if (yPos > 220) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Dettaglio attività per giorno", 20, yPos);
  
  yPos += 8;
  
  const entriesByDate: Record<string, TimeEntry[]> = {};
  timeEntries
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .forEach(entry => {
      if (!entriesByDate[entry.date]) {
        entriesByDate[entry.date] = [];
      }
      entriesByDate[entry.date].push(entry);
    });
  
  const groupedData: (string | { content: string; styles?: any })[][] = [];
  
  Object.entries(entriesByDate).forEach(([date, entries]) => {
    const dayTotalSeconds = entries.reduce((acc, e) => acc + (e.duration_seconds || 0), 0);
    
    groupedData.push([
      { content: `📅 ${formatDate(date)}`, styles: { fontStyle: 'bold', fillColor: [240, 244, 255], textColor: [99, 102, 241] } },
      { content: '', styles: { fillColor: [240, 244, 255] } },
      { content: '', styles: { fillColor: [240, 244, 255] } },
      { content: '', styles: { fillColor: [240, 244, 255] } }
    ]);
    
    entries.forEach(entry => {
      const client = entry.client_id ? clientsMap[entry.client_id] : null;
      const clientName = client?.name || "Senza cliente";
      const description = entry.description || "-";
      const truncatedDesc = description.length > 50 ? description.substring(0, 47) + "..." : description;
      groupedData.push([
        '',
        clientName,
        truncatedDesc,
        formatDuration(entry.duration_seconds || 0)
      ]);
    });
    
    groupedData.push([
      { content: '', styles: { fillColor: [248, 250, 252] } },
      { content: '', styles: { fillColor: [248, 250, 252] } },
      { content: 'Subtotale giorno', styles: { fontStyle: 'bold', halign: 'right', fillColor: [248, 250, 252] } },
      { content: formatDuration(dayTotalSeconds), styles: { fontStyle: 'bold', halign: 'right', fillColor: [248, 250, 252] } }
    ]);
  });
  
  autoTable(doc, {
    startY: yPos,
    head: [['Data', 'Cliente', 'Descrizione', 'Durata']],
    body: groupedData,
    theme: 'plain',
    headStyles: {
      fillColor: [99, 102, 241],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
    },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 40 },
      2: { cellWidth: 75 },
      3: { cellWidth: 25, halign: 'right' },
    },
    margin: { left: 20, right: 20 },
    didParseCell: function(data: any) {
      if (data.section === 'body') {
        data.cell.styles.lineWidth = 0.1;
        data.cell.styles.lineColor = [226, 232, 240];
      }
    },
  });
  
  return (doc as any).lastAutoTable.finalY;
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
  selectedClientName?: string,
  pdfLayout?: string[]
): string {
  const doc = new jsPDF();
  
  const layout = pdfLayout && pdfLayout.length > 0 
    ? pdfLayout 
    : ["summary", "clientBreakdown", "dailyDetails"];
  
  // Header
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, 210, 45, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Report Ore", 105, 22, { align: "center" });
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`${formatDate(dateFrom)} - ${formatDate(dateTo)}`, 105, 32, { align: "center" });
  
  if (selectedClientName) {
    doc.setFontSize(10);
    doc.text(`Cliente: ${selectedClientName}`, 105, 40, { align: "center" });
  }
  
  doc.setTextColor(0, 0, 0);
  
  let yPos = 60;
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  const greeting = recipientName ? `Ciao ${recipientName},` : 'Ciao,';
  doc.text(greeting, 20, yPos);
  yPos += 7;
  doc.text(`ecco il riepilogo delle ore lavorate inviato da ${senderName}.`, 20, yPos);
  yPos += 15;
  
  for (const section of layout) {
    switch (section) {
      case "summary":
        yPos = renderSummarySection(doc, yPos, totalSeconds, totalValue);
        break;
      case "clientBreakdown":
        yPos = renderClientBreakdownSection(doc, yPos, clientTotals, totalSeconds, totalValue);
        break;
      case "dailyDetails":
        yPos = renderDailyDetailsSection(doc, yPos, timeEntries, clientsMap);
        break;
    }
  }
  
  // Footer
  const finalY = yPos + 15;
  const pageHeight = doc.internal.pageSize.height;
  if (finalY > pageHeight - 20) {
    doc.addPage();
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text("Report generato con Tempora", 105, 20, { align: "center" });
  } else {
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text("Report generato con Tempora", 105, finalY, { align: "center" });
  }
  
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

    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("user_id", user.id)
      .single();

    const { data: clients } = await supabase
      .from("clients")
      .select("*")
      .eq("user_id", user.id);

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

    // Filter by task IDs if provided
    if (taskIds && taskIds.length > 0) {
      entriesQuery = entriesQuery.in("task_id", taskIds);
    }

    const { data: entries } = await entriesQuery;

    const timeEntries: TimeEntry[] = entries || [];
    const clientsMap: Record<string, Client> = {};
    (clients || []).forEach(c => { clientsMap[c.id] = c; });

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
              ${formatDate(dateFrom)} - ${formatDate(dateTo)}
            </p>
            ${selectedClient ? `<p style="color: rgba(255,255,255,0.8); margin: 4px 0 0 0; font-size: 14px;">Cliente: ${selectedClient.name}</p>` : ''}
          </div>
          
          <div style="background: white; padding: 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
            <p style="margin: 0 0 24px 0; color: #64748b;">
              ${recipientName ? `Ciao ${recipientName},` : 'Ciao,'}<br>
              ecco il riepilogo delle ore lavorate inviato da <strong>${senderName}</strong>.
            </p>
            
            <div style="display: flex; gap: 16px; margin-bottom: 32px;">
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
      subject: subject || `Report ore: ${formatDate(dateFrom)} - ${formatDate(dateTo)}`,
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
          selectedClient?.name,
          pdfLayout
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