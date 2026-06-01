import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Users, Image as ImageIcon, QrCode, X, Check } from "lucide-react";
import { toast } from "sonner";
import { adminTableService, tableColor, type AdminTable } from "../adminApi";
import { Topbar, Card, Btn, Pill } from "../ui";

export default function TablesView() {
  const [tables, setTables] = useState<AdminTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [editor, setEditor] = useState<{ open: boolean; table: AdminTable | null }>({
    open: false,
    table: null,
  });
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      setTables(await adminTableService.getAll());
    } catch {
      toast.error("Impossible de charger les tables");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (t: AdminTable) => {
    if (!window.confirm(`Supprimer la table « ${t.name} » ?`)) return;
    try {
      await adminTableService.remove(t.id);
      toast.success("Table supprimée");
      load();
    } catch (err: unknown) {
      const msg =
        (typeof err === "object" && err && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined) || "Suppression impossible";
      toast.error(msg);
    }
  };

  const totalGuests = tables.reduce((s, t) => s + t.guestCount, 0);

  return (
    <div>
      <Topbar
        title="Tables"
        subtitle={
          loading
            ? "Chargement…"
            : `${tables.length} table${tables.length > 1 ? "s" : ""} · ${totalGuests} invité${totalGuests > 1 ? "s" : ""}`
        }
        right={
          <Btn variant="primary" onClick={() => setEditor({ open: true, table: null })}>
            <Plus size={16} /> Nouvelle table
          </Btn>
        }
      />

      <div className="p-10">
        {loading ? (
          <p className="text-sm text-muted">Chargement des tables…</p>
        ) : tables.length === 0 ? (
          <Card className="text-center py-16">
            <div className="w-12 h-12 rounded-full bg-[color:var(--bg)] flex items-center justify-center mx-auto mb-3">
              <Users size={20} className="text-muted" />
            </div>
            <p className="text-sm text-muted mb-4">Aucune table pour l'instant</p>
            <Btn variant="primary" className="mx-auto" onClick={() => setEditor({ open: true, table: null })}>
              <Plus size={16} /> Créer la première table
            </Btn>
          </Card>
        ) : (
          <div className="space-y-2">
            {tables.map((t, i) => (
              <div
                key={t.id}
                className="grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center bg-white border border-line rounded-xl px-4 py-3 hover:border-momento transition"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${tableColor(i)}20` }}>
                  <span className="w-3 h-3 rounded-full" style={{ background: tableColor(i) }} />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-ink text-sm truncate">{t.name}</p>
                  <p className="text-xs text-muted font-mono">Table #{t.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Pill tone="neutral">
                    <Users size={11} /> {t.guestCount}
                  </Pill>
                  <Pill tone="neutral">
                    <ImageIcon size={11} /> {t.photoCount}
                  </Pill>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => navigate("/admin/qr")}
                    title="Voir le QR code"
                    className="p-1.5 hover:bg-[color:var(--bg)] rounded-md text-muted hover:text-ink"
                  >
                    <QrCode size={15} />
                  </button>
                  <button
                    onClick={() => setEditor({ open: true, table: t })}
                    title="Renommer"
                    className="p-1.5 hover:bg-[color:var(--bg)] rounded-md text-muted hover:text-ink"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => remove(t)}
                    title="Supprimer"
                    className="p-1.5 hover:bg-red-50 rounded-md text-muted hover:text-red-600"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editor.open && (
        <TableEditor
          table={editor.table}
          onClose={() => setEditor({ open: false, table: null })}
          onSaved={() => {
            setEditor({ open: false, table: null });
            load();
          }}
        />
      )}
    </div>
  );
}

function TableEditor({
  table,
  onClose,
  onSaved,
}: {
  table: AdminTable | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(table?.name ?? "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      if (table) {
        await adminTableService.rename(table.id, trimmed);
        toast.success("Table renommée");
      } else {
        await adminTableService.create(trimmed);
        toast.success("Table créée");
      }
      onSaved();
    } catch {
      toast.error("Enregistrement impossible");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-50 flex items-center justify-center p-8"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-line flex items-center justify-between">
          <h3 className="font-semibold text-ink">{table ? "Renommer la table" : "Nouvelle table"}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-[color:var(--bg)] rounded-md">
            <X size={18} />
          </button>
        </div>
        <div className="p-6">
          <label className="text-[11px] uppercase tracking-wider text-muted font-medium block mb-1.5">
            Nom de la table
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && save()}
            placeholder="Les Aventuriers"
            autoFocus
            className="w-full text-sm border border-line rounded-lg px-3 py-2.5 focus:outline-none focus:border-[color:var(--momento)]"
          />
        </div>
        <div className="px-6 py-4 border-t border-line flex items-center justify-end gap-2">
          <Btn variant="ghost" onClick={onClose}>
            Annuler
          </Btn>
          <Btn variant="primary" onClick={save} disabled={saving || !name.trim()}>
            <Check size={14} /> {table ? "Enregistrer" : "Créer"}
          </Btn>
        </div>
      </div>
    </div>
  );
}
