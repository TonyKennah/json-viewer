import React, { useState } from 'react';
import './App.css'; // Import our custom styles

// Recursive sub-component to construct the expandable JSON Tree-view
const JSONNode = ({ data, label }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const isObject = data !== null && typeof data === 'object';

  if (!isObject) {
    let displayValue = String(data);
    let valueClass = 'val-null';

    if (typeof data === 'string') {
      displayValue = `"${data}"`;
      valueClass = 'val-string';
    } else if (typeof data === 'number') {
      valueClass = 'val-number';
    } else if (typeof data === 'boolean') {
      valueClass = 'val-boolean';
    }

    return (
      <div className="json-node">
        {label && <span className="node-key">{label}:</span>}
        <span className={valueClass}>{displayValue}</span>
      </div>
    );
  }

  const isArray = Array.isArray(data);
  const keys = Object.keys(data);
  const bracketOpen = isArray ? '[' : '{';
  const bracketClose = isArray ? ']' : '}';

  return (
    <div className="json-node">
      <div className="node-row" onClick={() => setIsExpanded(!isExpanded)}>
        <span className="toggle-arrow">
          {keys.length > 0 ? (isExpanded ? '▼' : '▶') : ''}
        </span>
        {label && <span className="node-key">{label}:</span>}
        <span className="node-bracket">
          {bracketOpen}
          {!isExpanded && <span className="node-count">{keys.length} items</span>}
          {!isExpanded && bracketClose}
        </span>
      </div>

      {isExpanded && (
        <div className="node-children">
          {keys.map((key) => (
            <JSONNode key={key} label={isArray ? null : key} data={data[key]} />
          ))}
        </div>
      )}

      {isExpanded && <div className="node-bracket" style={{ marginLeft: '16px' }}>{bracketClose}</div>}
    </div>
  );
};

// Main Component
export default function App() {
  const [url, setUrl] = useState('');
  const [jsonData, setJsonData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchJson = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setError('');
    setJsonData(null);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      const data = await response.json();
      setJsonData(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch or parse JSON. Ensure the URL is valid and CORS-enabled.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>📁 JSON Viewer</h1>
        <p>Paste any public API or JSON URL below to parse and browse its hierarchy.</p>
      </header>

      <main className="main-content">
        <form onSubmit={fetchJson} className="url-form">
          <input
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className="url-input"
          />
          <button type="submit" disabled={isLoading} className="submit-btn">
            {isLoading ? 'Loading...' : 'Fetch JSON'}
          </button>
        </form>

        {error && (
          <div className="error-banner">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="viewer-window">
          <div className="viewer-header">
            <span className="viewer-title">Interactive Inspector</span>
            {jsonData && (
              <button
                onClick={() => { setJsonData(null); setUrl(''); setError(''); }}
                className="clear-btn"
              >
                Clear
              </button>
            )}
          </div>

          <div className="viewer-body">
            {isLoading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
              </div>
            ) : jsonData ? (
              <JSONNode data={jsonData} />
            ) : (
              <div className="placeholder-text">
                Ready. Enter a URL endpoint above to review data stream structure.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
