import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { exportToCSV } from "@/lib/export-timesheet";
import { toast } from "@/hooks/use-toast";
import { ExportPDFDialog } from "./ExportPDFDialog";

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
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);

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

  const handleOpenPDFDialog = () => {
    if (entries.length === 0) {
      toast({
        title: "Nessun dato",
        description: "Non ci sono registrazioni da esportare nel periodo selezionato.",
        variant: "destructive",
      });
      return;
    }
    setPdfDialogOpen(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Esporta
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleOpenPDFDialog}>
            <FileText className="w-4 h-4 mr-2" />
            Esporta PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportCSV}>
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Esporta CSV
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ExportPDFDialog
        open={pdfDialogOpen}
        onOpenChange={setPdfDialogOpen}
        entries={entries}
        clients={clients}
        dateRange={dateRange}
        userName={userName}
        logoUrl={logoUrl}
      />
    </>
  );
}
