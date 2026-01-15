import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface LogoUploadProps {
  userId: string;
  currentLogoUrl: string | null;
  onLogoChange: (url: string | null) => void;
}

export function LogoUpload({ userId, currentLogoUrl, onLogoChange }: LogoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Tipo file non valido",
        description: "Seleziona un'immagine (PNG, JPG, GIF, SVG).",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File troppo grande",
        description: "L'immagine deve essere inferiore a 2MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/logo.${fileExt}`;

      // Delete existing logo if any
      await supabase.storage.from("logos").remove([`${userId}/logo.png`, `${userId}/logo.jpg`, `${userId}/logo.jpeg`, `${userId}/logo.gif`, `${userId}/logo.svg`]);

      // Upload new logo
      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage.from("logos").getPublicUrl(fileName);
      const logoUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      // Update profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ logo_url: logoUrl })
        .eq("user_id", userId);

      if (updateError) throw updateError;

      onLogoChange(logoUrl);
      toast({
        title: "Logo caricato",
        description: "Il tuo logo è stato caricato con successo.",
      });
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveLogo = async () => {
    setRemoving(true);

    try {
      // Remove from storage
      await supabase.storage.from("logos").remove([
        `${userId}/logo.png`,
        `${userId}/logo.jpg`,
        `${userId}/logo.jpeg`,
        `${userId}/logo.gif`,
        `${userId}/logo.svg`,
      ]);

      // Update profile
      const { error } = await supabase
        .from("profiles")
        .update({ logo_url: null })
        .eq("user_id", userId);

      if (error) throw error;

      onLogoChange(null);
      toast({
        title: "Logo rimosso",
        description: "Il tuo logo è stato rimosso.",
      });
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="space-y-3">
      <Label>Logo per esportazione PDF</Label>
      <div className="flex items-center gap-4">
        {/* Logo preview */}
        <div className="w-20 h-20 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden bg-muted/50">
          {currentLogoUrl ? (
            <img
              src={currentLogoUrl}
              alt="Logo"
              className="w-full h-full object-contain p-1"
            />
          ) : (
            <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            {currentLogoUrl ? "Cambia logo" : "Carica logo"}
          </Button>
          {currentLogoUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveLogo}
              disabled={removing}
              className="text-destructive hover:text-destructive"
            >
              {removing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <X className="w-4 h-4 mr-2" />
              )}
              Rimuovi
            </Button>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Carica il tuo logo (max 2MB) per personalizzare i PDF esportati.
      </p>
    </div>
  );
}
