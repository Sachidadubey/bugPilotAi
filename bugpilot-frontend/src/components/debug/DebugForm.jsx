import { useState, useRef } from "react";
import { analyzeApi } from "../../api/debug.api";
import toast from "react-hot-toast";

const INPUT_TYPES = [
  { value: "code",  label: "Code",       icon: "bi-code-slash"  },
  { value: "text",  label: "Error Text", icon: "bi-file-text"   },
  { value: "log",   label: "Log File",   icon: "bi-journal-text"},
  { value: "image", label: "Screenshot", icon: "bi-image"       },
];

const LANGUAGES = [
  "javascript","typescript","python","java","c","cpp",
  "csharp","go","rust","ruby","php","other",
];

const MODES = [
  { value: "analyze",  label: "Analyze",  icon: "bi-search"     },
  { value: "fix",      label: "Fix Bug",  icon: "bi-wrench"     },
  { value: "optimize", label: "Optimize", icon: "bi-lightning"  },
];

export default function DebugForm({ onResult, onLoading }) {
  const [inputType, setInputType] = useState("code");
  const [textInput, setTextInput] = useState("");
  const [language,  setLanguage]  = useState("javascript");
  const [mode,      setMode]      = useState("analyze");
  const [file,      setFile]      = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [dragOver,  setDragOver]  = useState(false);
  const fileRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    onLoading?.(true);

    try {
      const fd = new FormData();
      fd.append("inputType", inputType);
      fd.append("mode",      mode);
      if (textInput) fd.append("textInput", textInput);
      if (language)  fd.append("language",  language);
      if (file)      fd.append("file",      file);

      const { data } = await analyzeApi(fd);
      onResult(data.data);
      toast.success("Analysis complete!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Analysis failed");
    } finally {
      setLoading(false);
      onLoading?.(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Input type tabs */}
      <div className="bp-card mb-3">
        <div className="small fw-bold text-muted text-uppercase mb-2">Input Type</div>
        <div className="d-flex gap-2 flex-wrap">
          {INPUT_TYPES.map((t) => (
            <button key={t.value} type="button"
              onClick={() => { setInputType(t.value); setFile(null); }}
              className={`btn btn-sm ${inputType === t.value
                ? "btn-primary" : "btn-outline-secondary"}`}>
              <i className={`bi ${t.icon} me-1`} />{t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mode */}
      <div className="bp-card mb-3">
        <div className="small fw-bold text-muted text-uppercase mb-2">Mode</div>
        <div className="d-flex gap-2 flex-wrap">
          {MODES.map((m) => (
            <button key={m.value} type="button"
              onClick={() => setMode(m.value)}
              className={`btn btn-sm ${mode === m.value
                ? "btn-primary" : "btn-outline-secondary"}`}>
              <i className={`bi ${m.icon} me-1`} />{m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Text input */}
      {inputType !== "image" && (
        <div className="bp-card mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div className="small fw-bold text-muted text-uppercase">
              {inputType === "code" ? "Code Snippet" :
               inputType === "log"  ? "Log Content"  : "Error Message"}
            </div>
            {inputType === "code" && (
              <select className="form-select form-select-sm w-auto"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}>
                {LANGUAGES.map((l) => (
                  <option key={l} value={l} className="text-capitalize">{l}</option>
                ))}
              </select>
            )}
          </div>
          <textarea rows={10}
            className="form-control font-monospace"
            style={{ fontSize: 13, resize: "vertical",
              background: "#1e1e2e", color: "#cdd6f4",
              border: "1px solid #374151", borderRadius: 8 }}
            placeholder={
              inputType === "code" ? "// Paste your error or buggy code here..." :
              inputType === "log"  ? "Paste your log file content here..." :
              "Describe the error or paste the error message..."
            }
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            required
          />
          <div className="d-flex justify-content-between mt-1">
            <span className="text-muted" style={{ fontSize: 11 }}>
              {textInput.length} characters
            </span>
            <button type="button" className="btn btn-sm btn-link text-muted p-0"
              onClick={() => setTextInput("")} style={{ fontSize: 11 }}>
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Image upload */}
      {inputType === "image" && (
        <div className="bp-card mb-3">
          <div className="small fw-bold text-muted text-uppercase mb-2">Screenshot</div>
          <div
            className={`border-2 border-dashed rounded-3 p-4 text-center`}
            style={{
              borderStyle: "dashed",
              borderColor: dragOver ? "#4f46e5" : "#e5e7eb",
              background:  dragOver ? "#eef2ff" : "#f8fafc",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" className="d-none"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setFile(e.target.files[0])} />
            {file ? (
              <div>
                <i className="bi bi-image-fill text-primary fs-3 d-block mb-2"></i>
                <div className="fw-semibold text-dark">{file.name}</div>
                <div className="text-muted small">{(file.size / 1024).toFixed(1)} KB</div>
                <button type="button" className="btn btn-sm btn-outline-danger mt-2"
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                  Remove
                </button>
              </div>
            ) : (
              <div>
                <i className="bi bi-cloud-upload text-muted fs-2 d-block mb-2"></i>
                <div className="fw-semibold text-dark mb-1">
                  Drop screenshot here or click to browse
                </div>
                <div className="text-muted small">JPEG, PNG, WebP — max 5MB</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Submit */}
      <button type="submit" className="btn btn-primary w-100 py-3 fw-semibold fs-6"
        disabled={loading || (inputType === "image" && !file)}>
        {loading ? (
          <><span className="spinner-border spinner-border-sm me-2" />
            AI is analyzing your code...</>
        ) : (
          <><i className="bi bi-cpu-fill me-2" />
            {mode === "fix" ? "Fix Bug with AI" :
             mode === "optimize" ? "Optimize with AI" :
             "Analyze with AI"}</>
        )}
      </button>
    </form>
  );
}