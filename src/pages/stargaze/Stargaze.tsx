import { useState } from "react";
import styles from "./Stargaze.module.css";

type StargazeResult = {
  go: boolean;
  reason: string;
  skyObjects: string[];
};

const MOCK_SCENARIOS: StargazeResult[] = [
  {
    go: true,
    reason: "clear skies and low moonlight",
    skyObjects: ["Mars", "Jupiter", "ISS at 9:40pm", "Moon: Waxing Crescent"],
  },
  {
    go: false,
    reason: "heavy cloud cover expected overnight",
    skyObjects: ["Saturn (obscured)", "Full Moon", "Jupiter"],
  },
  {
    go: true,
    reason: "excellent visibility and no moon until midnight",
    skyObjects: ["Venus", "Saturn", "Milky Way core visible", "ISS at 10:15pm"],
  },
];

function getMockResult(city: string): StargazeResult {
  const sum = city
    .toLowerCase()
    .split("")
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return MOCK_SCENARIOS[sum % MOCK_SCENARIOS.length];
}

export default function Stargaze() {
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StargazeResult | null>(null);

  function handleCheck() {
    if (!city.trim()) return;
    setResult(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setResult(getMockResult(city.trim()));
    }, 1000);
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>✦ Stargaze</h1>
        <p className={styles.subtitle}>Should you go stargazing tonight?</p>
      </header>

      <div className={styles.inputRow}>
        <input
          className={styles.input}
          type="text"
          placeholder="Enter your city (e.g. Auckland)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCheck()}
        />
        <button
          className={styles.button}
          onClick={handleCheck}
          disabled={loading || !city.trim()}
        >
          {loading ? "Checking…" : "Check Tonight"}
        </button>
      </div>

      {loading && (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Scanning the skies over {city}…</p>
        </div>
      )}

      {result && !loading && (
        <div className={styles.results}>
          <div className={`${styles.box} ${result.go ? styles.go : styles.nogo}`}>
            <div className={styles.decision}>{result.go ? "GO" : "DON'T GO"}</div>
            <p className={styles.reason}>{result.reason}</p>
          </div>

          <div className={styles.box}>
            <p className={styles.boxLabel}>Sky Tonight</p>
            <ul className={styles.skyList}>
              {result.skyObjects.map((obj, i) => (
                <li key={i}>{obj}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
