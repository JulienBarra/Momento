import { useEffect, useMemo, useState } from "react";
import { Plus, Globe, Users, Target, Pencil, Trash2, X, Check, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import {
  adminMissionService,
  adminTableService,
  tableColor,
  type AdminMission,
  type AdminTable,
} from "../adminApi";
import { Topbar, Card, Btn, Pill } from "../ui";

export default function MissionsView() {
  const [missions, setMissions] = useState<AdminMission[]>([]);
  const [tables, setTables] = useState<AdminTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"global" | "table">("global");
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [editing, setEditing] = useState<AdminMission | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [ms, ts] = await Promise.all([
        adminMissionService.getAll(),
        adminTableService.getAll(),
      ]);
      setMissions(ms);
      setTables(ts);
      if (ts.length && selectedTable === null) setSelectedTable(ts[0].id);
    } catch {
      toast.error("Impossible de charger les missions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const colorOf = useMemo(() => {
    const map: Record<number, string> = {};
    tables.forEach((t, i) => (map[t.id] = tableColor(i)));
    return map;
  }, [tables]);

  const globals = missions.filter((m) => m.isGlobal);
  const tableMissions = missions.filter((m) => !m.isGlobal);

  const remove = async (m: AdminMission) => {
    if (!window.confirm(`Supprimer la mission « ${m.title} » ?`)) return;
    try {
      await adminMissionService.remove(m.id);
      toast.success("Mission supprimée");
      load();
    } catch {
      toast.error("Suppression impossible");
    }
  };

  const duplicateToAll = async () => {
    if (selectedTable === null) return;
    const source = tableMissions.filter((m) => m.tableId === selectedTable);
    const targets = tables.filter((t) => t.id !== selectedTable);
    if (source.length === 0 || targets.length === 0) return;
    if (!window.confirm(`Dupliquer ${source.length} mission(s) sur ${targets.length} table(s) ?`))
      return;
    try {
      await Promise.all(
        source.flatMap((m) =>
          targets.map((t) =>
            adminMissionService.create({
              title: m.title,
              description: m.description,
              isGlobal: false,
              tableId: t.id,
            })
          )
        )
      );
      toast.success("Missions dupliquées");
      load();
    } catch {
      toast.error("Duplication impossible");
    }
  };

  return (
    <div>
      <Topbar
        title="Missions"
        subtitle="Défis photo proposés aux invités"
        right={
          <Btn variant="primary" onClick={() => setCreating(true)}>
            <Plus size={16} /> Nouvelle mission
          </Btn>
        }
      />

      <div className="px-10 pt-6">
        <div className="inline-flex bg-white border border-line rounded-lg p-1">
          <button
            onClick={() => setTab("global")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition flex items-center gap-2 ${
              tab === "global" ? "bg-momento-50 text-[color:var(--momento-600)]" : "text-muted hover:text-ink"
            }`}
          >
            <Globe size={14} /> Globales ({globals.length})
          </button>
          <button
            onClick={() => setTab("table")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition flex items-center gap-2 ${
              tab === "table" ? "bg-purple-50 text-purple-700" : "text-muted hover:text-ink"
            }`}
          >
            <Users size={14} /> Par table ({tableMissions.length})
          </button>
        </div>
      </div>

      <div className="p-10">
        {loading ? (
          <p className="text-sm text-muted">Chargement…</p>
        ) : tab === "global" ? (
          <GlobalList missions={globals} onEdit={setEditing} onDelete={remove} />
        ) : (
          <TableTab
            tables={tables}
            tableMissions={tableMissions}
            colorOf={colorOf}
            selectedTable={selectedTable}
            setSelectedTable={setSelectedTable}
            onCreate={() => setCreating(true)}
            onEdit={setEditing}
            onDelete={remove}
            onDuplicate={duplicateToAll}
          />
        )}
      </div>

      {(creating || editing) && (
        <MissionEditor
          mission={editing}
          tables={tables}
          defaultTable={tab === "table" ? selectedTable : null}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
          onSaved={() => {
            setEditing(null);
            setCreating(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function GlobalList({
  missions,
  onEdit,
  onDelete,
}: {
  missions: AdminMission[];
  onEdit: (m: AdminMission) => void;
  onDelete: (m: AdminMission) => void;
}) {
  if (missions.length === 0) {
    return (
      <Card className="text-center py-14">
        <div className="w-12 h-12 rounded-full bg-[color:var(--bg)] flex items-center justify-center mx-auto mb-3">
          <Globe size={20} className="text-muted" />
        </div>
        <p className="text-sm text-muted">Aucune mission globale</p>
      </Card>
    );
  }
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-2 text-[11px] uppercase tracking-wider text-muted font-medium border-b border-line">
        <div className="w-8" />
        <div>Intitulé</div>
        <div className="w-40">Progression</div>
        <div>Actions</div>
      </div>
      {missions.map((m) => {
        const pct = Math.min(100, (m.completedCount / Math.max(m.target, 1)) * 100);
        return (
          <div
            key={m.id}
            className="grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center bg-white border border-line rounded-xl px-4 py-3 hover:border-momento transition"
          >
            <div className="w-8 h-8 rounded-full bg-momento-50 flex items-center justify-center">
              <Globe size={14} className="text-momento" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-ink text-sm truncate">{m.title}</p>
              {m.description ? (
                <p className="text-xs text-muted line-clamp-2">{m.description}</p>
              ) : (
                <p className="text-xs text-muted">Proposée à tous</p>
              )}
            </div>
            <div className="w-40">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-muted font-mono tabular-nums">
                  {m.completedCount}/{m.target}
                </span>
                <span className="text-[11px] text-ink font-mono tabular-nums">{Math.round(pct)}%</span>
              </div>
              <div className="h-1.5 bg-[color:var(--bg)] rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-momento" style={{ width: `${pct}%` }} />
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onEdit(m)}
                className="p-1.5 hover:bg-[color:var(--bg)] rounded-md text-muted hover:text-ink"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => onDelete(m)}
                className="p-1.5 hover:bg-red-50 rounded-md text-muted hover:text-red-600"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TableTab({
  tables,
  tableMissions,
  colorOf,
  selectedTable,
  setSelectedTable,
  onCreate,
  onEdit,
  onDelete,
  onDuplicate,
}: {
  tables: AdminTable[];
  tableMissions: AdminMission[];
  colorOf: Record<number, string>;
  selectedTable: number | null;
  setSelectedTable: (id: number) => void;
  onCreate: () => void;
  onEdit: (m: AdminMission) => void;
  onDelete: (m: AdminMission) => void;
  onDuplicate: () => void;
}) {
  if (tables.length === 0) {
    return <p className="text-sm text-muted">Créez d'abord des tables.</p>;
  }
  const t = tables.find((x) => x.id === selectedTable) ?? tables[0];
  const ms = tableMissions.filter((m) => m.tableId === t.id);

  return (
    <div className="grid grid-cols-[240px_1fr] gap-6">
      <div className="space-y-1">
        {tables.map((tb) => {
          const count = tableMissions.filter((m) => m.tableId === tb.id).length;
          const active = t.id === tb.id;
          return (
            <button
              key={tb.id}
              onClick={() => setSelectedTable(tb.id)}
              className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                active ? "bg-white border border-line shadow-sm" : "hover:bg-[color:var(--bg)]"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: colorOf[tb.id] }} />
              <span className="text-sm font-medium text-ink flex-1 truncate">{tb.name}</span>
              <span className="text-xs text-muted font-mono">{count}</span>
            </button>
          );
        })}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted">Missions pour</p>
            <h3 className="text-xl font-bold text-ink flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: colorOf[t.id] }} /> {t.name}
            </h3>
          </div>
          <Btn variant="outline" onClick={onCreate}>
            <Plus size={14} /> Ajouter à cette table
          </Btn>
        </div>

        {ms.length === 0 ? (
          <Card className="text-center py-14">
            <div className="w-12 h-12 rounded-full bg-[color:var(--bg)] flex items-center justify-center mx-auto mb-3">
              <Target size={20} className="text-muted" />
            </div>
            <p className="text-sm text-muted">Aucune mission spécifique pour cette table</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {ms.map((m) => {
              const done = m.completedCount >= m.target;
              return (
                <div
                  key={m.id}
                  className="bg-white border border-line rounded-xl p-4 flex items-center gap-4 hover:border-purple-300 transition"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      done ? "bg-purple-600" : "bg-purple-50"
                    }`}
                  >
                    {done ? (
                      <Check size={18} className="text-white" />
                    ) : (
                      <Users size={16} className="text-purple-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-ink truncate">{m.title}</p>
                    {m.description && (
                      <p className="text-xs text-muted line-clamp-2 mt-0.5">{m.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-0.5">
                      <Pill tone={done ? "green" : "purple"}>
                        {done ? (
                          <>
                            <Check size={10} /> Accomplie
                          </>
                        ) : (
                          "En cours"
                        )}
                      </Pill>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEdit(m)}
                      className="p-1.5 hover:bg-[color:var(--bg)] rounded-md text-muted hover:text-ink"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => onDelete(m)}
                      className="p-1.5 hover:bg-red-50 rounded-md text-muted hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {ms.length > 0 && tables.length > 1 && (
          <Card className="mt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-ink">Dupliquer sur toutes les tables</p>
                <p className="text-xs text-muted mt-0.5">
                  Copie les missions de cette table vers les {tables.length - 1} autres.
                </p>
              </div>
              <Btn variant="outline" onClick={onDuplicate}>
                <ChevronRight size={14} /> Dupliquer
              </Btn>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function MissionEditor({
  mission,
  tables,
  defaultTable,
  onClose,
  onSaved,
}: {
  mission: AdminMission | null;
  tables: AdminTable[];
  defaultTable: number | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(mission?.title ?? "");
  const [description, setDescription] = useState(mission?.description ?? "");
  const [isGlobal, setIsGlobal] = useState(mission ? mission.isGlobal : defaultTable === null);
  const [tableId, setTableId] = useState<number>(
    mission?.tableId ?? defaultTable ?? tables[0]?.id ?? 0
  );
  const [applyAll, setApplyAll] = useState(false);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const desc = description.trim() || null;
    setSaving(true);
    try {
      if (mission) {
        await adminMissionService.update(mission.id, {
          title: trimmed,
          description: desc,
          isGlobal,
          tableId: isGlobal ? null : tableId,
        });
        toast.success("Mission enregistrée");
      } else {
        await adminMissionService.create({
          title: trimmed,
          description: desc,
          isGlobal,
          tableId: isGlobal ? null : tableId,
          applyToAllTables: !isGlobal && applyAll,
        });
        toast.success("Mission créée");
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
      <div className="bg-white rounded-xl max-w-xl w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-line flex items-center justify-between">
          <h3 className="font-semibold text-ink">
            {mission ? "Modifier la mission" : "Nouvelle mission"}
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-[color:var(--bg)] rounded-md">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="text-[11px] uppercase tracking-wider text-muted font-medium block mb-1.5">
              Intitulé du défi
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Capturez les mariés en train de s'embrasser"
              autoFocus
              className="w-full text-sm border border-line rounded-lg px-3 py-2.5 focus:outline-none focus:border-[color:var(--momento)]"
            />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wider text-muted font-medium block mb-1.5">
              Description <span className="text-muted/60 normal-case">(optionnel)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Petite blague ou précision affichée sous le titre"
              rows={2}
              className="w-full text-sm border border-line rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:border-[color:var(--momento)]"
            />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wider text-muted font-medium block mb-1.5">
              Portée
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setIsGlobal(true)}
                className={`text-left rounded-lg border-2 p-3 transition ${
                  isGlobal
                    ? "border-[color:var(--momento)] bg-momento-50"
                    : "border-line bg-white hover:border-[color:var(--momento)]"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Globe size={14} className="text-momento" />
                  <span className="text-sm font-semibold text-ink">Globale</span>
                </div>
                <p className="text-xs text-muted">Proposée à tous les invités, toutes tables confondues</p>
              </button>
              <button
                onClick={() => setIsGlobal(false)}
                className={`text-left rounded-lg border-2 p-3 transition ${
                  !isGlobal ? "border-purple-500 bg-purple-50" : "border-line bg-white hover:border-purple-300"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Users size={14} className="text-purple-600" />
                  <span className="text-sm font-semibold text-ink">Par table</span>
                </div>
                <p className="text-xs text-muted">Spécifique à une ou plusieurs tables</p>
              </button>
            </div>
          </div>
          {!isGlobal && (
            <div>
              <label className="text-[11px] uppercase tracking-wider text-muted font-medium block mb-1.5">
                Table concernée
              </label>
              <select
                value={tableId}
                disabled={applyAll}
                onChange={(e) => setTableId(Number(e.target.value))}
                className="w-full text-sm border border-line rounded-lg px-3 py-2.5 bg-white disabled:bg-[color:var(--bg)] disabled:text-muted"
              >
                {tables.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              {!mission && (
                <label className="flex items-center gap-2 mt-3 text-sm text-ink cursor-pointer">
                  <input
                    type="checkbox"
                    className="mm"
                    checked={applyAll}
                    onChange={(e) => setApplyAll(e.target.checked)}
                  />
                  Appliquer à toutes les tables ({tables.length})
                </label>
              )}
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-line flex items-center justify-end gap-2">
          <Btn variant="ghost" onClick={onClose}>
            Annuler
          </Btn>
          <Btn variant="primary" onClick={save} disabled={saving || !title.trim()}>
            <Check size={14} /> {mission ? "Enregistrer" : "Créer la mission"}
          </Btn>
        </div>
      </div>
    </div>
  );
}
