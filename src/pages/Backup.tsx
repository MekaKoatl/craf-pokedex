import { useState, type ChangeEvent } from "react";
import { useFavorites } from "../hooks/useFavorites";
import { useLists } from "../hooks/useLists";
import { useTeams } from "../hooks/useTeams";
import {
  BACKUP_SECTIONS,
  applyBackup,
  backupFileName,
  buildBackup,
  parseBackup,
  type BackupData,
  type BackupSection,
  type ImportMode,
  type ParsedBackup,
} from "../lib/backup";

/** Clases de las casillas y opciones de la página. */
const optionClass =
  "flex items-center gap-2 min-h-[45px] sm:min-h-0 text-sm text-gray-700 cursor-pointer";

/** Cantidad de elementos de una sección, para mostrar junto a su casilla. */
function countOf(data: Partial<BackupData>, key: BackupSection): number {
  return data[key]?.length ?? 0;
}

/** Agrega la sección si no está o la quita si está. */
function toggle(list: BackupSection[], key: BackupSection): BackupSection[] {
  return list.includes(key) ? list.filter((k) => k !== key) : [...list, key];
}

/**
 * Página Backup (`/backup`): exporta favoritos, listas y equipos a un
 * archivo `.json` e importa ese archivo en otro navegador o dispositivo,
 * eligiendo qué secciones incluir y si se combinan o reemplazan los datos.
 */
export function Backup() {
  const { favorites, replaceFavorites } = useFavorites();
  const { lists, replaceLists } = useLists();
  const { teams, replaceTeams } = useTeams();
  const current: BackupData = { favorites, lists, teams };

  const [exportKeys, setExportKeys] = useState<BackupSection[]>([
    "favorites",
    "lists",
    "teams",
  ]);

  // Importación: archivo leído, secciones elegidas, modo y resultado
  const [parsed, setParsed] = useState<ParsedBackup | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [importKeys, setImportKeys] = useState<BackupSection[]>([]);
  const [mode, setMode] = useState<ImportMode>("merge");
  const [done, setDone] = useState<string[] | null>(null);
  // Cambia la key del input de archivo para vaciarlo
  const [inputKey, setInputKey] = useState(0);

  function handleExport() {
    const file = buildBackup(current, exportKeys);
    const blob = new Blob([JSON.stringify(file, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = backupFileName();
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setParsed(null);
    setFileError(null);
    setDone(null);
    if (!file) return;
    try {
      const result = parseBackup(await file.text());
      setParsed(result);
      // Por defecto se eligen todas las secciones que trae el archivo
      setImportKeys(
        BACKUP_SECTIONS.map((s) => s.key).filter(
          (k) => result.data[k] !== undefined,
        ),
      );
    } catch (err) {
      setFileError(
        err instanceof Error ? err.message : "Could not read the file.",
      );
    }
  }

  function handleImport() {
    if (!parsed) return;
    if (
      mode === "replace" &&
      !confirm(
        "Replace your current data with the backup? This can't be undone.",
      )
    )
      return;
    const { result, notes } = applyBackup(
      current,
      parsed.data,
      importKeys,
      mode,
    );
    if (importKeys.includes("favorites")) replaceFavorites(result.favorites);
    if (importKeys.includes("lists")) replaceLists(result.lists);
    if (importKeys.includes("teams")) replaceTeams(result.teams);
    setDone([...parsed.notes, ...notes]);
    setParsed(null);
    setInputKey((k) => k + 1);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Backup</h1>
        <p className="text-gray-600 leading-relaxed">
          Your favorites, lists and teams are saved only in this browser. To use
          them on another device, download a backup here and import it there
          (for example, send the file to your phone).
        </p>
      </div>

      {/* Exportar */}
      <section className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
        <h2 className="text-xl font-bold">Export</h2>
        <div className="flex flex-col sm:flex-row sm:gap-6">
          {BACKUP_SECTIONS.map((s) => (
            <label key={s.key} className={optionClass}>
              <input
                type="checkbox"
                checked={exportKeys.includes(s.key)}
                onChange={() => setExportKeys((k) => toggle(k, s.key))}
                className="w-4 h-4 accent-red-600"
              />
              {s.label} ({countOf(current, s.key)})
            </label>
          ))}
        </div>
        <button
          onClick={handleExport}
          disabled={exportKeys.length === 0}
          className="btn-primary self-start min-h-[45px] sm:min-h-0 px-5 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Download backup
        </button>
      </section>

      {/* Importar */}
      <section className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
        <h2 className="text-xl font-bold">Import</h2>
        <input
          key={inputKey}
          type="file"
          accept=".json,application/json"
          onChange={handleFile}
          className="text-base sm:text-sm text-gray-700 file:btn-ghost file:mr-3"
        />

        {fileError && <p className="text-sm text-red-600">{fileError}</p>}

        {parsed && (
          <>
            <p className="text-sm font-semibold text-gray-700">Import:</p>
            <div className="flex flex-col sm:flex-row sm:gap-6">
              {BACKUP_SECTIONS.map((s) => {
                const available = parsed.data[s.key] !== undefined;
                return (
                  <label
                    key={s.key}
                    className={`${optionClass} ${available ? "" : "opacity-40 cursor-not-allowed"}`}
                  >
                    <input
                      type="checkbox"
                      disabled={!available}
                      checked={importKeys.includes(s.key)}
                      onChange={() => setImportKeys((k) => toggle(k, s.key))}
                      className="w-4 h-4 accent-red-600"
                    />
                    {s.label}{" "}
                    {available
                      ? `(${countOf(parsed.data, s.key)})`
                      : "(not in file)"}
                  </label>
                );
              })}
            </div>

            <p className="text-sm font-semibold text-gray-700">
              If you already have data:
            </p>
            <div className="flex flex-col gap-1">
              <label className={optionClass}>
                <input
                  type="radio"
                  name="mode"
                  checked={mode === "merge"}
                  onChange={() => setMode("merge")}
                  className="w-4 h-4 accent-red-600"
                />
                Merge: add what's new and keep what I have
              </label>
              <label className={optionClass}>
                <input
                  type="radio"
                  name="mode"
                  checked={mode === "replace"}
                  onChange={() => setMode("replace")}
                  className="w-4 h-4 accent-red-600"
                />
                Replace: keep only what's in the file
              </label>
            </div>

            <button
              onClick={handleImport}
              disabled={importKeys.length === 0}
              className="btn-primary self-start min-h-[45px] sm:min-h-0 px-5 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Import
            </button>
          </>
        )}

        {done && (
          <div className="bg-white border border-gray-200 rounded-lg p-3 text-sm text-gray-700">
            <p className="font-semibold">Backup imported.</p>
            {done.length > 0 && (
              <ul className="list-disc pl-5 mt-1 text-gray-500">
                {done.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
