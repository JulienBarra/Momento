import { useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Printer, Download, Check } from "lucide-react";
import { toast } from "sonner";
import { adminTableService, tableColor, type AdminTable } from "../adminApi";
import { Topbar, Card, Btn, Pill } from "../ui";
import { EVENT } from "../config";

export default function QRCodesView() {
  const [tables, setTables] = useState<AdminTable[]>([]);
  const [urls, setUrls] = useState<Record<number, string>>({});
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const ts = await adminTableService.getAll();
        setTables(ts);
        setSelected(new Set(ts.map((t) => t.id)));
        // Récupère en parallèle le lien signé de chaque table
        const entries = await Promise.all(
          ts.map(async (t) => [t.id, (await adminTableService.qrLink(t.id)).url] as const)
        );
        setUrls(Object.fromEntries(entries));
      } catch {
        toast.error("Impossible de charger les QR codes");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const colorOf = useMemo(() => {
    const map: Record<number, string> = {};
    tables.forEach((t, i) => (map[t.id] = tableColor(i)));
    return map;
  }, [tables]);

  const toggle = (id: number) =>
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const selectedTables = tables.filter((t) => selected.has(t.id));

  const downloadAllPng = () => {
    selectedTables.forEach((t) => {
      const svg = document.getElementById(`qr-svg-${t.id}`) as SVGSVGElement | null;
      if (svg) downloadSvgAsPng(svg, `qr-table-${t.id}-${slug(t.name)}.png`);
    });
  };

  return (
    <div>
      <Topbar
        title="QR codes"
        subtitle="Générez et imprimez les cartes à déposer sur chaque table"
        right={
          <>
            <Btn variant="outline" onClick={downloadAllPng} disabled={selectedTables.length === 0}>
              <Download size={16} /> Télécharger les PNG
            </Btn>
            <Btn variant="primary" onClick={() => window.print()}>
              <Printer size={16} /> Imprimer la planche
            </Btn>
          </>
        }
      />

      <div className="p-10 grid grid-cols-[320px_1fr] gap-8">
        {/* Config */}
        <div className="space-y-4 no-print">
          <Card>
            <p className="font-semibold text-ink mb-1">Lien de base</p>
            <p className="text-xs text-muted mb-3">Chaque QR contient l'ID de table et une signature unique</p>
            <div className="bg-[color:var(--bg)] border border-line rounded-lg p-3 font-mono text-[11px] text-ink break-all">
              {urls[selectedTables[0]?.id] ?? `${import.meta.env.VITE_API_URL || ""}/join?tableId=…&signature=…`}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-ink">Tables à imprimer</p>
              <button
                onClick={() => setSelected(new Set(tables.map((t) => t.id)))}
                className="text-xs text-muted hover:text-ink"
              >
                Tout sélectionner
              </button>
            </div>
            {tables.length === 0 ? (
              <p className="text-sm text-muted">Aucune table. Créez-en dans l'onglet Tables.</p>
            ) : (
              <div className="space-y-1">
                {tables.map((t) => {
                  const checked = selected.has(t.id);
                  return (
                    <label
                      key={t.id}
                      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md cursor-pointer transition ${
                        checked ? "bg-momento-50" : "hover:bg-[color:var(--bg)]"
                      }`}
                    >
                      <input type="checkbox" className="mm" checked={checked} onChange={() => toggle(t.id)} />
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: colorOf[t.id] }} />
                      <span className="text-sm text-ink flex-1 truncate">{t.name}</span>
                      <span className="text-[11px] text-muted font-mono">T{t.id}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </Card>

          <Card>
            <p className="font-semibold text-ink mb-2">Format</p>
            <div className="space-y-1.5 text-sm">
              <Row label="Papier" value="A4 (2 × A6)" />
              <Row label="Par page" value="2 cartes" />
              <Row label="Dimensions" value="105 × 148 mm" mono />
              <Row label="Correction" value="Haute (30 %)" />
            </div>
          </Card>

          <Card className="bg-momento-50 border-[color:var(--momento-50)]">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-momento flex items-center justify-center flex-shrink-0">
                <Check size={14} className="text-white" />
              </div>
              <div className="text-xs text-ink leading-relaxed">
                <p className="font-semibold mb-1">Astuce</p>
                Imprimez sur papier épais (220 g/m²) puis pliez au milieu pour obtenir une carte de
                table autoportante recto-verso.
              </div>
            </div>
          </Card>
        </div>

        {/* Preview grid */}
        <div>
          <div className="flex items-center gap-2 mb-4 no-print">
            <p className="font-semibold text-ink">
              Aperçu · {selectedTables.length} carte{selectedTables.length > 1 ? "s" : ""}
            </p>
            <Pill tone="outline">
              <Printer size={10} /> Prêt à imprimer
            </Pill>
          </div>

          {loading ? (
            <p className="text-sm text-muted">Génération des QR codes…</p>
          ) : (
            <div className="print-area grid grid-cols-2 gap-4">
              {selectedTables.map((t) => (
                <TableCard key={t.id} table={t} color={colorOf[t.id]} url={urls[t.id]} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between text-ink">
      <span className="text-muted">{label}</span>
      <span className={mono ? "font-mono" : ""}>{value}</span>
    </div>
  );
}

function TableCard({ table, color, url }: { table: AdminTable; color: string; url?: string }) {
  return (
    <div className="bg-white border border-line rounded-xl overflow-hidden" style={{ breakInside: "avoid" }}>
      <div className="h-2" style={{ background: color }} />
      <div className="p-6 text-center">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted font-medium mb-1">Momento</p>
        <p className="font-title text-4xl text-ink leading-none mb-1">{EVENT.couple}</p>
        <p className="text-xs text-muted mb-4">{EVENT.dateLong}</p>

        <div className="inline-flex flex-col items-center gap-2 bg-[color:var(--bg)] border border-line rounded-lg p-4 mb-4">
          {url ? (
            <QRCodeSVG id={`qr-svg-${table.id}`} value={url} size={170} level="H" marginSize={2} />
          ) : (
            <div className="w-[170px] h-[170px] img-ph rounded" />
          )}
        </div>

        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full" style={{ background: color }} />
          <p className="text-[11px] uppercase tracking-widest text-muted font-medium">Table {table.id}</p>
          <span className="w-2 h-2 rounded-full" style={{ background: color }} />
        </div>
        <p className="text-lg font-semibold text-ink mb-3">{table.name}</p>

        <div className="text-[10px] text-muted leading-relaxed border-t border-line pt-3">
          Scannez ce code pour rejoindre la fête et
          <br />
          partager vos photos en direct · Momento
        </div>
      </div>
    </div>
  );
}

function slug(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .toLowerCase()
    .replace(/^-+|-+$/g, "");
}

// Convertit un <svg> QR en PNG haute résolution et déclenche le téléchargement.
function downloadSvgAsPng(svg: SVGSVGElement, filename: string, size = 1024) {
  const xml = new XMLSerializer().serializeToString(svg);
  const svgBlob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
    }
    URL.revokeObjectURL(url);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      URL.revokeObjectURL(a.href);
    }, "image/png");
  };
  img.src = url;
}
