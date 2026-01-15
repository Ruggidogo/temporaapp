import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    const { recipientEmail, recipientName, subject, dateFrom, dateTo, clientId }: ReportEmailRequest = await req.json();

    if (!recipientEmail || !dateFrom || !dateTo) {
      return new Response(JSON.stringify({ error: "Parametri mancanti" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Fetch profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("user_id", user.id)
      .single();

    // Fetch clients
    const { data: clients } = await supabase
      .from("clients")
      .select("*")
      .eq("user_id", user.id);

    // Fetch time entries
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

    const { data: entries } = await entriesQuery;

    const timeEntries: TimeEntry[] = entries || [];
    const clientsMap: Record<string, Client> = {};
    (clients || []).forEach(c => { clientsMap[c.id] = c; });

    // Calculate totals
    const totalSeconds = timeEntries.reduce((acc, e) => acc + (e.duration_seconds || 0), 0);
    
    // Group by client
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
            
            <!-- Summary boxes -->
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
            
            <!-- Client breakdown -->
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
            
            <p style="margin: 32px 0 0 0; font-size: 14px; color: #94a3b8; text-align: center;">
              Report generato con ❤️ da Tempora
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Tempora <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: subject || `Report ore: ${formatDate(dateFrom)} - ${formatDate(dateTo)}`,
      html: emailHtml,
    });

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
