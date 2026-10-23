import { useEffect, useState } from "react";
import GroceryForm from "./components/GroceryForm.jsx";
import GroceryList from "./components/GroceryList.jsx";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

async function requestGroceries(path = "", options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}/groceries${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch {
    throw new Error(
      `Cannot reach the backend at ${API_URL}. Start the backend in a second terminal with "cd backend" and "npm run dev".`,
    );
  }

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error("The backend returned an unexpected response. Check the backend terminal for errors.");
  }
  if (!response.ok) {
    throw new Error(result.message || "The request could not be completed.");
  }
  return result;
}

function App() {
  const [groceries, setGroceries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadGroceries() {
    setLoading(true);
    setError("");
    try {
      const items = await requestGroceries();
      setGroceries(items);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGroceries();
  }, []);

  async function addGrocery(grocery) {
    setWorking(true);
    setError("");
    setMessage("");
    try {
      await requestGroceries("", {
        method: "POST",
        body: JSON.stringify(grocery),
      });
      setMessage("Item added to your list.");
      await loadGroceries();
      return true;
    } catch (requestError) {
      setError(requestError.message);
      return false;
    } finally {
      setWorking(false);
    }
  }

  async function updatePurchased(item) {
    return updateGrocery(item, { purchased: !item.purchased }, "Item status updated.");
  }

  async function updateGrocery(item, changes, successMessage) {
    setWorking(true);
    setError("");
    setMessage("");
    try {
      await requestGroceries(`/${item._id}`, {
        method: "PATCH",
        body: JSON.stringify(changes),
      });
      await loadGroceries();
      setMessage(successMessage);
      return true;
    } catch (requestError) {
      setError(requestError.message);
      return false;
    } finally {
      setWorking(false);
    }
  }

  async function deleteGrocery(item) {
    setWorking(true);
    setError("");
    setMessage("");
    try {
      await requestGroceries(`/${item._id}`, { method: "DELETE" });
      setMessage("Item deleted from your list.");
      await loadGroceries();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setWorking(false);
    }
  }

  return (
    <main className="page">
      <section className="shopping-card" aria-labelledby="page-title">
        <header className="page-header">
          <p className="eyebrow">PLAN YOUR NEXT SHOP</p>
          <h1 id="page-title">Grocery list</h1>
          <p className="subtitle">Keep track of what you need and what you have bought.</p>
        </header>

        <GroceryForm onAdd={addGrocery} disabled={working} />

        {message && <p className="notice success" role="status">{message}</p>}
        {error && <p className="notice error" role="alert">{error}</p>}

        <section className="list-section" aria-labelledby="list-title">
          <div className="list-heading">
            <h2 id="list-title">Your items</h2>
            <span className="item-count">{groceries.length} {groceries.length === 1 ? "item" : "items"}</span>
          </div>

          {loading ? (
            <p className="empty-state" role="status">Loading your groceries…</p>
          ) : (
            <GroceryList
              groceries={groceries}
              onToggle={updatePurchased}
              onEdit={(item, changes) => updateGrocery(item, changes, "Item details updated.")}
              onDelete={deleteGrocery}
              disabled={working}
            />
          )}
        </section>
      </section>
      <footer className="page-footer">A little list makes shopping easier.</footer>
    </main>
  );
}

export default App;
