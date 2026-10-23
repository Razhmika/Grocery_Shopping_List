import { useState } from "react";

function GroceryList({ groceries, onToggle, onEdit, onDelete, disabled }) {
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editQuantity, setEditQuantity] = useState("1");
  const [validationError, setValidationError] = useState("");

  if (groceries.length === 0) {
    return <p className="empty-state">Your list is empty. Add your first grocery above.</p>;
  }

  function startEditing(item) {
    setEditingId(item._id);
    setEditName(item.name);
    setEditQuantity(String(item.quantity));
    setValidationError("");
  }

  function cancelEditing() {
    setEditingId(null);
    setValidationError("");
  }

  async function saveChanges(event, item) {
    event.preventDefault();
    const name = editName.trim();
    const quantity = Number(editQuantity);

    if (!name) {
      setValidationError("Please enter a grocery name.");
      return;
    }
    if (name.length > 100) {
      setValidationError("Grocery name cannot be longer than 100 characters.");
      return;
    }
    if (!editQuantity || !Number.isFinite(quantity) || quantity < 1) {
      setValidationError("Quantity must be at least 1.");
      return;
    }

    const wasUpdated = await onEdit(item, { name, quantity });
    if (wasUpdated) {
      setEditingId(null);
      setValidationError("");
    }
  }

  return (
    <ul className="grocery-list">
      {groceries.map((item) => {
        const isEditing = editingId === item._id;

        return (
          <li className={`grocery-item${item.purchased ? " purchased" : ""}`} key={item._id}>
            {isEditing ? (
              <form className="edit-form" onSubmit={(event) => saveChanges(event, item)}>
                <label className="edit-field edit-name-field">
                  <span>Name</span>
                  <input
                    type="text"
                    value={editName}
                    onChange={(event) => setEditName(event.target.value)}
                    maxLength="100"
                    required
                    autoFocus
                    disabled={disabled}
                  />
                </label>
                <label className="edit-field edit-quantity-field">
                  <span>Quantity</span>
                  <input
                    type="number"
                    value={editQuantity}
                    onChange={(event) => setEditQuantity(event.target.value)}
                    min="1"
                    step="1"
                    required
                    disabled={disabled}
                  />
                </label>
                <div className="edit-actions">
                  <button className="save-button" type="submit" disabled={disabled}>Save</button>
                  <button className="cancel-button" type="button" onClick={cancelEditing} disabled={disabled}>Cancel</button>
                </div>
                {validationError && <p className="form-error edit-error" role="alert">{validationError}</p>}
              </form>
            ) : (
              <>
                <label className="item-main">
                  <input
                    type="checkbox"
                    checked={item.purchased}
                    onChange={() => onToggle(item)}
                    disabled={disabled}
                    aria-label={`Mark ${item.name} as ${item.purchased ? "not purchased" : "purchased"}`}
                  />
                  <span className="item-name">{item.name}</span>
                </label>
                <span className="quantity-badge">Qty {item.quantity}</span>
                <span className="item-status">{item.purchased ? "Purchased" : "Not purchased"}</span>
                <button
                  className="edit-button"
                  type="button"
                  onClick={() => startEditing(item)}
                  disabled={disabled}
                  aria-label={`Edit ${item.name}`}
                >
                  Edit
                </button>
                <button
                  className="delete-button"
                  type="button"
                  onClick={() => onDelete(item)}
                  disabled={disabled}
                  aria-label={`Delete ${item.name}`}
                >
                  Delete
                </button>
              </>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default GroceryList;
