import { useEffect, useState } from 'react';
import { SkipForward } from 'lucide-react';
import { getAutoSkipEnabled, setAutoSkipEnabled } from '../../utils/settings';

export default function App() {
  const [enabled, setEnabled] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getAutoSkipEnabled().then((value) => {
      setEnabled(value);
      setLoaded(true);
    });
  }, []);

  async function toggle() {
    const next = !enabled;
    setEnabled(next);

    try {
      await setAutoSkipEnabled(next);
    } catch {
      setEnabled(!next); // Revert the switch if saving fails.
    }
  }

  return (
    <main className="flex w-72 flex-col gap-4 p-4">
      <header className="flex items-center gap-2">
        <SkipForward className="h-5 w-5" />
        <h1 className="text-lg font-semibold">YouTube Ad Skip</h1>
      </header>

      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Auto Skip</p>
          <p className="text-sm text-gray-500">
            {loaded ? (enabled ? 'Enabled' : 'Disabled') : 'Loading...'}
          </p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Auto Skip"
          disabled={!loaded}
          onClick={toggle}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
            enabled ? 'bg-red-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
              enabled ? 'translate-x-[22px]' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>
    </main>
  );
}