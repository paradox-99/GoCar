// AddressSearch.jsx
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

// Simple debounce hook (no deps)
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function AddressSearch({ onSelect, apiKey, provider = 'locationiq', defaultValue = '', placeholder = '' }) {
  // onSelect receives { display_name, lat, lon, raw }
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const [error, setError] = useState(null);
  const countryFilter = 'bd';

  // close dropdown when clicking outside
  useEffect(() => {
    function onDoc(e) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => {
    async function fetchSuggestions(q) {
      if (!q || q.length < 2) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);

      try {
        let url = '';
        if (provider === 'locationiq') {
          // LocationIQ autocomplete endpoint
          // NOTE: replace apiKey with your LocationIQ token
          url = `https://us1.locationiq.com/v1/autocomplete.php?key=${encodeURIComponent(apiKey)}&q=${encodeURIComponent(q)}&format=json&limit=6&countrycodes=${countryFilter}`;
        } else {
          // fallback to OSM Nominatim (public) — be kind to their servers (cache + rate-limit)
          url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&addressdetails=1&limit=6&countrycodes=${countryFilter}`;
        }

        const res = await fetch(url, {
          headers: {
            // Nominatim asks for a proper User-Agent; if you use fetch in browser it's usually okay.
            // For backend proxy, set your app's user-agent contacting their service.
          },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        // Normalize both LocationIQ and Nominatim results to { display_name, lat, lon, raw }
        const normalized = (Array.isArray(data) ? data : []).map((item) => {
          // LocationIQ returns { display_name, lat, lon } same shape as Nominatim.
          return {
            display_name: item.display_name || item.description || `${item.name || ''} ${item.state || ''}`.trim(),
            lat: item.lat || item.latitude,
            lon: item.lon || item.longitude,
            raw: item,
          };
        });

        setResults(normalized);
        setOpen(true);
      } catch (err) {
        console.error('Geocode error', err);
        setError('Failed to fetch suggestions.');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }

    fetchSuggestions(debouncedQuery);
  }, [debouncedQuery, apiKey, provider]);

  function handleSelect(item) {
    setQuery(item.display_name);
    setOpen(false);
    setResults([]);
    if (onSelect) onSelect(item);
  }

  console.log(defaultValue);


  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {
        defaultValue &&
        <input
          id="address-search"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls="address-search-list"
          aria-activedescendant=""
          placeholder={placeholder}
          value={query}
          defaultValue={defaultValue ? defaultValue : ""}
          onChange={(e) => { setQuery(e.target.value); }}
          onFocus={() => { if (results.length) setOpen(true); }}
          className='md:w-[500px] h-[61px] rounded p-4 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
        />
      }


      {loading && <div style={{ position: 'absolute', right: 10, top: 12, fontSize: 12 }}>…</div>}

      {open && results.length > 0 && (
        <ul
          id="address-search-list"
          role="listbox"
          style={{
            position: 'absolute',
            zIndex: 1000,
            left: 0,
            right: 0,
            marginTop: 6,
            listStyle: 'none',
            padding: 0,
            borderRadius: 8,
            maxHeight: 260,
            overflow: 'auto',
            boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
            background: '#fff',
            border: '1px solid rgba(0,0,0,0.08)',
          }}
        >
          {results.map((r, idx) => (
            <li
              key={`${r.lat}-${r.lon}-${idx}`}
              role="option"
              onClick={() => handleSelect(r)}
              style={{
                padding: '10px 12px',
                cursor: 'pointer',
                borderBottom: '1px solid rgba(0,0,0,0.03)',
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSelect(r); }}
              tabIndex={0}
            >
              <div style={{ fontSize: 14, lineHeight: '18px' }}>{r.display_name}</div>
              {/* <div style={{ fontSize: 12, color: '#666' }}>{r.lat && r.lon ? `${parseFloat(r.lat).toFixed(5)}, ${parseFloat(r.lon).toFixed(5)}` : null}</div> */}
            </li>
          ))}
        </ul>
      )}

      {error && <div style={{ color: 'crimson', marginTop: 6 }}>{error}</div>}
    </div>
  );
}

AddressSearch.propTypes = {
  onSelect: PropTypes.func.isRequired,
  apiKey: PropTypes.string, // required if provider === 'locationiq'
  provider: PropTypes.oneOf(['locationiq', 'nominatim']),
  placeholder: PropTypes.string,
};
