/**
 * TimePicker — AM/PM dropdown-based time selector.
 * Stores value in HH:mm (24-hour) for the backend.
 * Shows a user-friendly 12-hour AM/PM interface.
 *
 * Props:
 *   value    – HH:mm string or ''
 *   onChange – (HH:mm string) => void
 *   label    – optional label text
 */
export default function TimePicker({ value, onChange, label }) {
  const parse = (v) => {
    if (!v) return { hour: '', minute: '00', ampm: 'AM' };
    const [h, m] = v.split(':').map(Number);
    const ampm  = h >= 12 ? 'PM' : 'AM';
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return { hour: String(hour12), minute: String(m).padStart(2, '0'), ampm };
  };

  const { hour, minute, ampm } = parse(value);

  const emit = (h, m, ap) => {
    if (!h) { onChange(''); return; }
    let h24 = Number(h);
    if (ap === 'AM' && h24 === 12) h24 = 0;
    if (ap === 'PM' && h24 !== 12) h24 += 12;
    onChange(`${String(h24).padStart(2, '0')}:${m}`);
  };

  const HOURS   = ['1','2','3','4','5','6','7','8','9','10','11','12'];
  const MINUTES = ['00','05','10','15','20','25','30','35','40','45','50','55'];

  // Shared select style — fixed widths so text is never clipped
  const sel = 'border border-gray-200 rounded-lg bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-church-blue/30 focus:border-church-blue transition-all cursor-pointer';

  return (
    <div>
      {label && <label className="form-label">{label}</label>}
      <div className="flex items-center gap-1.5">

        {/* Hour — wide enough for "12" */}
        <select
          value={hour}
          onChange={e => emit(e.target.value, minute, ampm)}
          className={sel}
          style={{ width: '62px', padding: '8px 6px' }}
          aria-label="Hour"
        >
          <option value="">HH</option>
          {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
        </select>

        <span className="text-gray-400 font-bold text-base select-none">:</span>

        {/* Minute */}
        <select
          value={minute}
          onChange={e => emit(hour, e.target.value, ampm)}
          className={sel}
          style={{ width: '62px', padding: '8px 6px' }}
          aria-label="Minute"
        >
          {MINUTES.map(m => <option key={m} value={m}>{m}</option>)}
        </select>

        {/* AM / PM */}
        <select
          value={ampm}
          onChange={e => emit(hour, minute, e.target.value)}
          className={sel}
          style={{ width: '62px', padding: '8px 6px' }}
          aria-label="AM or PM"
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>

      </div>
    </div>
  );
}

/** Formats a stored HH:mm value for display  e.g. "9:30 AM" */
export function formatTime(value) {
  if (!value) return '—';
  const [h, m] = value.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12  = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}
