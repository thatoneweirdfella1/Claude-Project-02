import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Paperclip } from "lucide-react";
import { GlassButton } from "../primitives";
import { useDismissableLayer } from "../../keyboard";
import { useAccountStore } from "../../stores/accountStore";
import { useSessionStore } from "../../stores/sessionStore";
import type { ContextItem } from "../../stores/types";
import { ContextManagerDialog } from "../context/ContextManagerDialog";
import {
  FILE_INPUT_ACCEPT,
  fetchUrlContext,
  getSharedOcrClient,
  isValidVariableName,
  uploadFiles,
  type RejectedFile,
} from "../../services/context";

export interface AttachContextControlsProps {
  onAttach?: () => void;
  onContext?: () => void;
}

type PopoverView = "menu" | "text" | "url" | "variable";

function textBytes(value: string): number {
  try { return new TextEncoder().encode(value).byteLength; } catch { return value.length * 2; }
}

function contextId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function AttachContextControls({ onAttach = () => {}, onContext = () => {} }: AttachContextControlsProps) {
  const context = useSessionStore((s) => s.context);
  const sessionVariables = useSessionStore((s) => s.variables);
  const addContextItem = useSessionStore((s) => s.addContextItem);
  const setSessionVariable = useSessionStore((s) => s.setSessionVariable);
  const accountVariables = useAccountStore((s) => s.variables);
  const setAccountVariable = useAccountStore((s) => s.setVariable);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [view, setView] = useState<PopoverView>("menu");
  const [managerOpen, setManagerOpen] = useState(false);
  const [rejections, setRejections] = useState<RejectedFile[]>([]);
  const [pendingFiles, setPendingFiles] = useState<string[]>([]);
  const [textName, setTextName] = useState("");
  const [textValue, setTextValue] = useState("");
  const [urlValue, setUrlValue] = useState("");
  const [urlFetching, setUrlFetching] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [urlPreview, setUrlPreview] = useState<ContextItem | null>(null);
  const [variableSearch, setVariableSearch] = useState("");
  const [selectedVariables, setSelectedVariables] = useState<string[]>([]);
  const [variableName, setVariableName] = useState("");
  const [variableValue, setVariableValue] = useState("");
  const [saveVariableToAccount, setSaveVariableToAccount] = useState(false);
  const [variableError, setVariableError] = useState<string | null>(null);

  useDismissableLayer(open, () => setOpen(false));

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (rootRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const availableVariables = useMemo(() => {
    const merged = { ...accountVariables, ...sessionVariables };
    const needle = variableSearch.trim().toLowerCase();
    return Object.entries(merged).filter(([name, value]) => !needle || `${name} ${value}`.toLowerCase().includes(needle));
  }, [accountVariables, sessionVariables, variableSearch]);

  function currentSessionBytes(): number {
    return context.reduce((sum, item) => sum + item.bytes, 0);
  }

  function resetPopover() {
    setView("menu");
    setTextName("");
    setTextValue("");
    setUrlValue("");
    setUrlError(null);
    setUrlPreview(null);
    setVariableSearch("");
    setSelectedVariables([]);
    setVariableName("");
    setVariableValue("");
    setSaveVariableToAccount(false);
    setVariableError(null);
  }

  function closePopover() {
    setOpen(false);
    resetPopover();
  }

  function chooseUpload() {
    fileInputRef.current?.click();
    setOpen(false);
  }

  async function handleFilesPicked(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const names = Array.from(fileList).map((file) => file.name);
    setPendingFiles(names);
    setRejections([]);
    try {
      const { accepted, rejected } = await uploadFiles(fileList, currentSessionBytes(), { ocrClient: getSharedOcrClient() });
      for (const item of accepted) addContextItem(item);
      setRejections(rejected);
    } finally {
      setPendingFiles([]);
    }
  }

  function addPastedText() {
    const name = textName.trim();
    const content = textValue.trim();
    if (!name || !content) return;
    addContextItem({ id: contextId("text"), kind: "text", label: name, content, bytes: textBytes(content) });
    closePopover();
  }

  async function previewUrl() {
    setUrlFetching(true);
    setUrlError(null);
    setUrlPreview(null);
    try {
      const outcome = await fetchUrlContext(urlValue, currentSessionBytes());
      if (outcome.ok) setUrlPreview(outcome.item);
      else setUrlError(outcome.message);
    } finally {
      setUrlFetching(false);
    }
  }

  function addUrlPreview() {
    if (!urlPreview) return;
    addContextItem(urlPreview);
    closePopover();
  }

  function addUrlReferenceOnly() {
    const value = urlValue.trim();
    if (!value) return;
    addContextItem({ id: contextId("url"), kind: "url", label: value, content: value, bytes: textBytes(value) });
    closePopover();
  }

  function toggleVariable(name: string) {
    setSelectedVariables((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name]);
  }

  function addSelectedVariables() {
    const merged = { ...accountVariables, ...sessionVariables };
    for (const name of selectedVariables) {
      if (merged[name] !== undefined) setSessionVariable(name, merged[name]);
    }
    closePopover();
  }

  function createVariable() {
    const name = variableName.trim();
    if (!isValidVariableName(name)) {
      setVariableError("Use letters, numbers, and underscores only, starting with a letter or underscore.");
      return;
    }
    setSessionVariable(name, variableValue);
    if (saveVariableToAccount) setAccountVariable(name, variableValue);
    closePopover();
  }

  function openManager() {
    onContext();
    setOpen(false);
    setManagerOpen(true);
  }

  return <div className="attach-context-controls" ref={rootRef}>
    <input
      ref={fileInputRef}
      type="file"
      accept={FILE_INPUT_ACCEPT}
      multiple
      className="attach-context-controls__file-input"
      aria-hidden="true"
      tabIndex={-1}
      onChange={(event) => { void handleFilesPicked(event.target.files); event.target.value = ""; }}
    />

    <GlassButton
      className="attach-menu-toggle"
      onClick={() => {
        onAttach();
        setOpen((current) => !current);
        if (open) resetPopover();
      }}
      aria-haspopup="menu"
      aria-expanded={open}
    >
      <Paperclip size={16} aria-hidden="true" /> Add Context <ChevronDown size={15} aria-hidden="true" />
    </GlassButton>

    {open && <div className="surface-smoked-glass attach-context-controls__popover" role="menu" data-testid="attach-popover">
      {view === "menu" && <>
        <button type="button" role="menuitem" className="attach-context-controls__popover-row" onClick={chooseUpload}>File</button>
        <button type="button" role="menuitem" className="attach-context-controls__popover-row" onClick={() => setView("text")}>Paste Text</button>
        <button type="button" role="menuitem" className="attach-context-controls__popover-row" onClick={() => setView("url")}>URL</button>
        <button type="button" role="menuitem" className="attach-context-controls__popover-row" onClick={() => setView("variable")}>Variable</button>
        <button type="button" role="menuitem" className="attach-context-controls__popover-row" onClick={openManager}>Manage All</button>
      </>}

      {view === "text" && <form className="attach-context-controls__url-form" onSubmit={(event) => { event.preventDefault(); addPastedText(); }}>
        <label>Context name<input autoFocus value={textName} onChange={(event) => setTextName(event.target.value)} placeholder="Meeting notes" /></label>
        <label>Paste text<textarea value={textValue} onChange={(event) => setTextValue(event.target.value)} placeholder="Paste the text to include…" /></label>
        <div className="attach-context-controls__url-actions"><button type="button" onClick={() => setView("menu")}>Back</button><button type="submit" disabled={!textName.trim() || !textValue.trim()}>Add Text</button></div>
      </form>}

      {view === "url" && <form className="attach-context-controls__url-form" onSubmit={(event) => { event.preventDefault(); void previewUrl(); }}>
        <label htmlFor="attach-url-input">URL to load as context</label>
        <input id="attach-url-input" autoFocus value={urlValue} onChange={(event) => { setUrlValue(event.target.value); setUrlPreview(null); setUrlError(null); }} placeholder="https://…" disabled={urlFetching} />
        {urlFetching && <p role="status">Loading readable text…</p>}
        {urlError && <div role="alert"><p>{urlError}</p><button type="button" onClick={addUrlReferenceOnly}>Add URL reference only</button></div>}
        {urlPreview && <div className="context-manager-preview"><strong>{urlPreview.label}</strong><small>{urlPreview.bytes.toLocaleString()} bytes</small><pre>{urlPreview.content.slice(0, 1200)}</pre><button type="button" onClick={addUrlPreview}>Add to context</button></div>}
        <div className="attach-context-controls__url-actions"><button type="button" onClick={() => setView("menu")} disabled={urlFetching}>Back</button><button type="submit" disabled={urlFetching || !urlValue.trim()}>{urlPreview ? "Refresh preview" : "Preview"}</button></div>
      </form>}

      {view === "variable" && <div className="attach-context-controls__variable-form">
        <label>Find saved variables<input autoFocus value={variableSearch} onChange={(event) => setVariableSearch(event.target.value)} placeholder="Search variables" /></label>
        <div className="context-variable-list">
          {availableVariables.length === 0 ? <p>No saved variables match.</p> : availableVariables.map(([name, value]) => <label key={name}><input type="checkbox" checked={selectedVariables.includes(name)} onChange={() => toggleVariable(name)} /><span><strong>${name}</strong><small>{value.slice(0, 80)}</small></span></label>)}
        </div>
        <button type="button" disabled={selectedVariables.length === 0} onClick={addSelectedVariables}>Add Selected</button>
        <hr />
        <strong>Create variable</strong>
        <label>Name<input value={variableName} onChange={(event) => { setVariableName(event.target.value); setVariableError(null); }} placeholder="project_name" /></label>
        <label>Value<input value={variableValue} onChange={(event) => setVariableValue(event.target.value)} /></label>
        <label><input type="checkbox" checked={saveVariableToAccount} onChange={(event) => setSaveVariableToAccount(event.target.checked)} /> Save for future sessions</label>
        {variableError && <p role="alert">{variableError}</p>}
        <div className="attach-context-controls__url-actions"><button type="button" onClick={() => setView("menu")}>Back</button><button type="button" disabled={!variableName.trim()} onClick={createVariable}>Create & Add</button></div>
      </div>}
    </div>}

    {pendingFiles.length > 0 && <div className="attach-context-controls__status" role="status">{pendingFiles.map((name) => <span key={name}>{name} · Reading…</span>)}</div>}
    {rejections.length > 0 && <div className="surface-smoked-glass attach-context-controls__rejections" role="status">{rejections.map(({ file, result }) => <p key={file.name}>{file.name}: {result.message}</p>)}<button type="button" onClick={() => setRejections([])}>Dismiss</button></div>}

    {managerOpen && <ContextManagerDialog onClose={() => setManagerOpen(false)} onAddMore={() => { setManagerOpen(false); setOpen(true); setView("menu"); }} />}
  </div>;
}
