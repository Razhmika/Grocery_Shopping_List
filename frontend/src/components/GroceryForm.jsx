import { useState } from "react";

function GroceryForm({ onAdd, disabled }) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [validationError, setValidationError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmedName = name.trim();
    const parsedQuantity = Number(quantity);

    if (!trimmedName) {
      setValidationError("Please enter a grocery name.");
      return;
    }
    if (!quantity || !Number.isFinite(parsedQuantity) || parsedQuantity < 1) {
      setValidationError("Quantity must be at least 1.");
      return;
    }

    setValidationError("");
    const wasAdded = await onAdd({ name: trimmedName, quantity: parsedQuantity });
    if (wasAdded) {
      setName("");
      setQuantity("1");
    }
  }

  return (
    <form className="grocery-form" onSubmit={handleSubmit}>
      <div className="form-fields">
        <label className="field name-field">
          <span>Grocery name</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Apples"
            maxLength="100"
            required
          />
        </label>
        <label className="field quantity-field">
          <span>Quantity</span>
          <input
            type="number"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            min="1"
            step="1"
            required
          />
        </label>
        <button className="add-button" type="submit" disabled={disabled}>
          {disabled ? "Please wait…" : "Add item"}
        </button>
      </div>
      {validationError && <p className="form-error" role="alert">{validationError}</p>}
    </form>
  );
}

export default GroceryForm;
