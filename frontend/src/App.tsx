import { useEffect, useState } from "react";

type BackendHealth = {
  status: string;
};

function App() {
  const [backendStatus, setBackendStatus] = useState<string>("loading");

  useEffect(() => {
    async function checkBackendHealth() {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/health`);

        if (!response.ok) {
          throw new Error("Backend response was not ok");
        }

        const data: BackendHealth = await response.json();
        setBackendStatus(data.status);
      } catch (error) {
        console.error("Failed to reach backend:", error);
        setBackendStatus("unreachable");
      }
    }

    checkBackendHealth();

    const intervalId = setInterval(checkBackendHealth, 2000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <section className="text-center rounded-xl bg-slate-900 border border-slate-800 p-8">
        <h1 className="text-4xl font-bold">ft_transcendence</h1>

        <p className="mt-4 text-slate-300">Online chess platform bootstrap.</p>

        <div className="mt-6 rounded-lg bg-slate-800 p-4">
          <p className="text-sm text-slate-400">Backend status</p>
          <p className="mt-1 text-xl font-bold">{backendStatus}</p>
        </div>
      </section>
    </main>
  );
}

export default App;
