import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, FileSpreadsheet, Loader2 } from "lucide-react";
import { exportToCSV, exportToPDF } from "@/lib/export-timesheet";
import { toast } from "@/hooks/use-toast";

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

interface ExportMenuProps {
  entries: TimeEntry[];
  clients: Client[];
  dateRange: { start: Date; end: Date };
  userName: string;
  logoUrl?: string | null;
  selectedClientId?: string;
}

export function ExportMenu({
  entries,
  clients,
  dateRange,
  userName,
  logoUrl,
  selectedClientId,
}: ExportMenuProps) {
  const [exporting, setExporting] = useState(false);

  const handleExportCSV = () => {
    if (entries.length === 0) {
      toast({
        title: "Nessun dato",
        description: "Non ci sono registrazioni da esportare nel periodo selezionato.",
        variant: "destructive",
      });
      return;
    }

    exportToCSV({
      entries,
      clients,
      dateRange,
      userName,
      logoUrl,
      selectedClientId,
    });

    toast({
      title: "CSV esportato",
      description: "Il file è stato scaricato con successo.",
    });
  };

  const handleExportPDF = async () => {
    if (entries.length === 0) {
      toast({
        title: "Nessun dato",
        description: "Non ci sono registrazioni da esportare nel periodo selezionato.",
        variant: "destructive",
      });
      return;
    }

    setExporting(true);

    try {
      await exportToPDF({
        entries,
        clients,
        dateRange,
        userName,
        logoUrl,
        selectedClientId,
      });

      toast({
        title: "PDF esportato",
        description: "Il file è stato scaricato con successo.",
      });
    } catch (error: any) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'esportazione.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={exporting}>
          {exporting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Esporta
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportPDF} disabled={exporting}>
          <FileText className="w-4 h-4 mr-2" />
          Esporta PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportCSV}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Esporta CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
