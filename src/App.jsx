import { useEffect, useState } from "react";
import db from "./db.js";

export default function App() {
  const [patients, setPatients] = useState([]);
  const [sql, setSql] = useState("SELECT * FROM patients;");
  const [result, setResult] = useState([]);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    const res = await db.query("SELECT * FROM patients ORDER BY created_at DESC;");
    setPatients(res.rows);
  };

  const addPatient = async () => {
    await db.run("INSERT INTO patients (name, age, gender) VALUES (?, ?, ?)", [
      "John Doe",
      30,
      "Male",
    ]);
    loadPatients();
  };

  const runQuery = async () => {
    try {
      const res = await db.query(sql);
      setResult(res.rows);
    } catch (err) {
      alert("Query error: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-4">Patient Registration App</h1>

      <button
        onClick={addPatient}
        className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
      >
        Add Dummy Patient
      </button>

      <h2 className="mt-6 text-xl">Patients</h2>
      <ul className="list-disc ml-5">
        {patients.map((p) => (
          <li key={p.id}>{p.name} — {p.age} — {p.gender}</li>
        ))}
      </ul>

      <div className="mt-8">
        <h2 className="text-xl mb-2">Run SQL Query</h2>
        <textarea
          className="w-full bg-gray-900 text-white p-2 rounded h-24"
          value={sql}
          onChange={(e) => setSql(e.target.value)}
        />
        <button
          onClick={runQuery}
          className="mt-2 bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
        >
          Run Query
        </button>

        {result.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg">Query Result:</h3>
            <pre className="bg-gray-800 p-3 rounded text-sm overflow-x-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
