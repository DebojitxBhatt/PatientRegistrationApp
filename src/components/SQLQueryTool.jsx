import React, { useState, useEffect } from 'react';
import { dbInitPromise, executeQuery } from '../db/config';

const EXAMPLE_QUERIES = [
  {
    title: 'Get all patients',
    query: 'SELECT * FROM patients ORDER BY created_at DESC;'
  },
  {
    title: 'Get patients by age range',
    query: 'SELECT * FROM patients WHERE age BETWEEN 20 AND 40;'
  },
  {
    title: 'Count patients by gender',
    query: 'SELECT gender, COUNT(*) as count FROM patients GROUP BY gender;'
  },
  {
    title: 'Recent registrations',
    query: "SELECT firstName, lastName, age, gender, created_at FROM patients WHERE created_at >= NOW() - INTERVAL '24 hours';"
  }
];

const SQLQueryTool = ({ darkMode }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    const initDb = async () => {
      try {
        await dbInitPromise();
        setDbReady(true);
        console.log('Database initialized successfully');
      } catch (error) {
        console.error('Database initialization failed:', error);
        setError('Failed to initialize database. Please refresh the page.');
      }
    };

    initDb();

    // Set up broadcast channel listener for database updates
    let dbChannel;
    try {
      dbChannel = new BroadcastChannel('pglite-db-ops');
      dbChannel.onmessage = async (event) => {
        if (event.data.type === 'DB_OPERATION' && query) {
          console.log('Received DB operation update, refreshing results');
          executeCurrentQuery();
        }
      };
    } catch (error) {
      console.warn('BroadcastChannel not supported in this browser. Cross-tab sync will be disabled.');
    }

    return () => {
      if (dbChannel) {
        try {
          dbChannel.close();
        } catch (error) {
          console.warn('Error closing BroadcastChannel:', error);
        }
      }
    };
  }, [query]);

  const executeCurrentQuery = async () => {
    if (!query.trim()) {
      setError('Please enter a query');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      console.log('Executing query:', query);
      const result = await executeQuery(query);
      console.log('Query result:', result);
      setResults(result.rows || []);
    } catch (err) {
      console.error('Query execution error:', err);
      setError(err.message || 'An error occurred while executing the query');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    await executeCurrentQuery();
  };

  const handleExampleClick = (exampleQuery) => {
    setQuery(exampleQuery);
    // Don't automatically execute the query when selecting an example
    setError(null);
  };

  if (!dbReady) {
    return (
      <div className={`rounded-lg ${darkMode ? 'bg-twitter-darker' : 'bg-white'} shadow-lg p-6`}>
        <h2 className="text-2xl font-bold mb-6">SQL Query Tool</h2>
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-twitter-blue border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg ${darkMode ? 'bg-twitter-darker' : 'bg-white'} shadow-lg p-6`}>
      <h2 className="text-2xl font-bold mb-6">SQL Query Tool</h2>
      
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2 text-gray-500">Example Queries</h3>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_QUERIES.map((example, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(example.query)}
              className={`px-3 py-1 rounded-full text-sm ${
                darkMode 
                  ? 'bg-gray-800 hover:bg-twitter-blue hover:text-white' 
                  : 'bg-gray-100 hover:bg-twitter-blue hover:text-white'
              } transition-colors`}
            >
              {example.title}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleQuerySubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">SQL Query</label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows="4"
            className={`w-full px-3 py-2 rounded-lg border ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-twitter-blue font-mono`}
            placeholder="Enter your SQL query here..."
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className={`w-full py-2 px-4 rounded-lg font-medium ${
            isLoading || !query.trim()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-twitter-blue hover:bg-blue-500 focus:ring-2 focus:ring-offset-2 focus:ring-twitter-blue'
          } text-white transition-colors`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span>Executing...</span>
            </div>
          ) : (
            'Execute Query'
          )}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 rounded-lg bg-red-100 text-red-700">
          <p className="font-medium">Error:</p>
          <p className="font-mono text-sm">{error}</p>
        </div>
      )}

      {results && results.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Results:</h3>
          <div className="overflow-x-auto">
            <table className={`min-w-full divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              <thead className={darkMode ? 'bg-gray-800' : 'bg-gray-50'}>
                <tr>
                  {Object.keys(results[0]).map((column) => (
                    <th
                      key={column}
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {results.map((row, rowIndex) => (
                  <tr key={rowIndex} className={darkMode ? 'bg-gray-800' : 'bg-white'}>
                    {Object.values(row).map((value, colIndex) => (
                      <td
                        key={colIndex}
                        className="px-6 py-4 whitespace-nowrap text-sm font-mono"
                      >
                        {value === null ? 'NULL' : value.toString()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {results && results.length === 0 && (
        <div className="mt-4 p-4 rounded-lg bg-gray-100 text-gray-700">
          <p>No results found</p>
        </div>
      )}
    </div>
  );
};

export default SQLQueryTool; 