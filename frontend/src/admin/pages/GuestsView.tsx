import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Users, Image as ImageIcon, X, Check, Search } from "lucide-react";
import { toast } from "sonner";
import {
  adminGuestService,
  adminTableService,
  tableColor,
  type AdminGuest,
  type AdminTable,
} from "../adminApi";
import { Topbar, Card, Btn, Pill } from "../ui";

// Extrait un message d'erreur lisible renvoyé par le backend.
function errorMessage(err: unknown, fallback: string): string {
  return (
    (typeof err === "object" && err && "response" in err
      ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
      : undefined) || fallback
  );
}

export default function GuestsView() {
  const [guests, setGuests] = useState<AdminGuest[]>([]);
  const [tables, setTables] = useState<AdminTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tableFilter, setTableFilter] = useState<number | "all">("all");
  const [editor, setEditor] = useState<{ open: boolean; guest: AdminGuest | null }>({
    open: false,
    guest: null,
  });

  const load = async () => {
    setLoading(true);
    try {
      const [gs, ts] = await Promise.all([
        adminGuestService.getAll(),
        adminTableService.getAll(),
      ]);
      setGuests(gs);
      setTables(ts);
    } catch {
      toast.error("Impossible de charger les invités");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Couleur par table, alignée sur l'ordre d'affichage des tables.
  const colorOf = useMemo(() => {
    const map: Record<number, string> = {};
    tables.forEach((t, i) => (map[t.id] = tableColor(i)));
    return map;
  }, [tables]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return guests.filter((g) => {
      if (tableFilter !== "all" && g.tableId !== tableFilter) return false;
      if (q && !g.nickname.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [guests, search, tableFilter]);

  const remove = async (g: AdminGuest) => {
    const warn =
      g.photoCount > 0
        ? `Supprimer l'invité « ${g.nickname} » ? Ses ${g.photoCount} photo${
            g.photoCount > 1 ? "s seront supprimées" : " sera supprimée"
          }.`
        : `Supprimer l'invité « ${g.nickname} » ?`;
    if (!window.confirm(warn)) return;
    try {
      await adminGuestService.remove(g.id);
      toast.success("Invité supprimé");
      load();
    } catch (err) {
      toast.error(errorMessage(err, "Suppression impossible"));
    }
  };

  return (
    <div>
      <Topbar
        title="Invités"
        subtitle={
          loading
            ? "Chargement…"
            : `${guests.length} invité${guests.length > 1 ? "s" : ""} connecté${
                guests.length > 1 ? "s" : ""
              }`
        }
        right={
          <Btn
            variant="primary"
            onClick={() => setEditor({ open: true, guest: null })}
            disabled={tables.length === 0}
          >
            <Plus size={16} /> Ajouter un invité
          </Btn>
        }
      />

      <div className="p-10">
        {/* Filtres */}
        {!loading && guests.length > 0 && (
          <div className="flex items-center gap-3 mb-5">
            <div className="relative flex-1 max-w-xs">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un pseudo…"
                className="w-full text-sm border border-line rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-[color:var(--momento)]"
              />
            </div>
            <select
              value={tableFilter}
              onChange={(e) =>
                setTableFilter(e.target.value === "all" ? "all" : Number(e.target.value))
              }
              className="text-sm border border-line rounded-lg px-3 py-2 bg-white"
            >
              <option value="all">Toutes les tables</option>
              {tables.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-muted">Chargement des invités…</p>
        ) : guests.length === 0 ? (
          <Card className="text-center py-16">
            <div className="w-12 h-12 rounded-full bg-[color:var(--bg)] flex items-center justify-center mx-auto mb-3">
              <Users size={20} className="text-muted" />
            </div>
            <p className="text-sm text-muted mb-1">Aucun invité pour l'instant</p>
            <p className="text-xs text-muted">
              Les invités apparaissent ici dès qu'ils scannent un QR code et choisissent un pseudo.
            </p>
          </Card>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted">Aucun invité ne correspond à la recherche.</p>
        ) : (
          <div className="space-y-2">
            {filtered.map((g) => (
              <div
                key={g.id}
                className="grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center bg-white border border-line rounded-xl px-4 py-3 hover:border-momento transition"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: `${colorOf[g.tableId] ?? "#888"}20` }}
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ background: colorOf[g.tableId] ?? "#888" }}
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-ink text-sm truncate">{g.nickname}</p>
                  <p className="text-xs text-muted font-mono">Invité #{g.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Pill tone="neutral">{g.table?.name ?? "Sans table"}</Pill>
                  <Pill tone="neutral">
                    <ImageIcon size={11} /> {g.photoCount}
                  </Pill>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditor({ open: true, guest: g })}
                    title="Modifier"
                    className="p-1.5 hover:bg-[color:var(--bg)] rounded-md text-muted hover:text-ink"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => remove(g)}
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
        <GuestEditor
          guest={editor.guest}
          tables={tables}
          onClose={() => setEditor({ open: false, guest: null })}
          onSaved={() => {
            setEditor({ open: false, guest: null });
            load();
          }}
        />
      )}
    </div>
  );
}

function GuestEditor({
  guest,
  tables,
  onClose,
  onSaved,
}: {
  guest: AdminGuest | null;
  tables: AdminTable[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [nickname, setNickname] = useState(guest?.nickname ?? "");
  const [tableId, setTableId] = useState<number>(guest?.tableId ?? tables[0]?.id ?? 0);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const trimmed = nickname.trim();
    if (!trimmed || !tableId) return;
    setSaving(true);
    try {
      if (guest) {
        await adminGuestService.update(guest.id, { nickname: trimmed, tableId });
        toast.success("Invité enregistré");
      } else {
        await adminGuestService.create({ nickname: trimmed, tableId });
        toast.success("Invité créé");
      }
      onSaved();
    } catch (err) {
      toast.error(errorMessage(err, "Enregistrement impossible"));
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
          <h3 className="font-semibold text-ink">
            {guest ? "Modifier l'invité" : "Nouvel invité"}
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-[color:var(--bg)] rounded-md">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="text-[11px] uppercase tracking-wider text-muted font-medium block mb-1.5">
              Pseudo
            </label>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && save()}
              placeholder="Tonton Gérard"
              autoFocus
              className="w-full text-sm border border-line rounded-lg px-3 py-2.5 focus:outline-none focus:border-[color:var(--momento)]"
            />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wider text-muted font-medium block mb-1.5">
              Table
            </label>
            <select
              value={tableId}
              onChange={(e) => setTableId(Number(e.target.value))}
              className="w-full text-sm border border-line rounded-lg px-3 py-2.5 bg-white"
            >
              {tables.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-line flex items-center justify-end gap-2">
          <Btn variant="ghost" onClick={onClose}>
            Annuler
          </Btn>
          <Btn variant="primary" onClick={save} disabled={saving || !nickname.trim() || !tableId}>
            <Check size={14} /> {guest ? "Enregistrer" : "Créer"}
          </Btn>
        </div>
      </div>
    </div>
  );
}
