"use client";

import { useState, useEffect } from "react";

interface DefinedCondition {
  id: number;
  description: string;
}

export default function DefinedConditionsPage() {
  const [conditions, setConditions] = useState<DefinedCondition[]>([]);
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchConditions();
  }, []);

  const fetchConditions = async () => {
    try {
      const response = await fetch("/api/defined-conditions");
      if (response.ok) {
        const data = await response.json();
        setConditions(data);
      }
    } catch (error) {
      console.error("Failed to fetch conditions:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/defined-conditions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Condition created successfully!" });
        setDescription("");
        fetchConditions();
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.error || "Failed to create condition" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (condition: DefinedCondition) => {
    setEditingId(condition.id);
    setEditDescription(condition.description);
  };

  const handleUpdate = async (id: number) => {
    if (!editDescription.trim()) return;

    try {
      const response = await fetch(`/api/defined-conditions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: editDescription }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Condition updated successfully!" });
        setEditingId(null);
        fetchConditions();
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.error || "Failed to update condition" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this condition?")) return;

    try {
      const response = await fetch(`/api/defined-conditions/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Condition deleted successfully!" });
        fetchConditions();
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.error || "Failed to delete condition" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred" });
    }
  };

  const getConditionEmoji = (description: string) => {
    const lower = description.toLowerCase();
    if (lower.includes("new")) return "✨";
    if (lower.includes("repair")) return "🔧";
    if (lower.includes("retired")) return "📦";
    if (lower.includes("missing")) return "❓";
    return "📋";
  };

  return (
    <div className="conditions-page">
      <header className="page-header">
        <h1>Defined Conditions</h1>
        <p>Manage asset condition types</p>
      </header>

      <div className="content-grid">
        <section className="form-section">
          <h2>Add New Condition</h2>
          {message && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}
          <form onSubmit={handleSubmit} className="condition-form">
            <div className="form-group">
              <label htmlFor="description">Condition Name</label>
              <input
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Good, Fair, Excellent"
                required
              />
            </div>
            <button type="submit" disabled={isLoading} className="submit-btn">
              {isLoading ? "Creating..." : "Add Condition"}
            </button>
          </form>
        </section>

        <section className="list-section">
          <h2>Existing Conditions ({conditions.length})</h2>
          <div className="conditions-list">
            {conditions.length === 0 ? (
              <p className="empty-state">No conditions defined yet. Add one above!</p>
            ) : (
              conditions.map((condition) => (
                <div key={condition.id} className="condition-card">
                  {editingId === condition.id ? (
                    <div className="edit-form">
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="edit-input"
                      />
                      <div className="edit-actions">
                        <button onClick={() => handleUpdate(condition.id)} className="save-btn">
                          Save
                        </button>
                        <button onClick={() => setEditingId(null)} className="cancel-btn">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="condition-info">
                        <span className="condition-emoji">{getConditionEmoji(condition.description)}</span>
                        <span className="condition-name">{condition.description}</span>
                      </div>
                      <div className="condition-actions">
                        <button onClick={() => handleEdit(condition)} className="edit-btn">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(condition.id)} className="delete-btn">
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <style jsx>{`
        .conditions-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .page-header {
          margin-bottom: 2rem;
        }

        .page-header h1 {
          font-size: 2rem;
          color: #1a1a1a;
          margin-bottom: 0.5rem;
        }

        .page-header p {
          color: #666;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 2rem;
        }

        @media (max-width: 768px) {
          .content-grid {
            grid-template-columns: 1fr;
          }
        }

        .form-section, .list-section {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .form-section h2, .list-section h2 {
          font-size: 1.25rem;
          margin-bottom: 1rem;
          color: #333;
        }

        .message {
          padding: 0.75rem 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .message.success {
          background: #d4edda;
          color: #155724;
        }

        .message.error {
          background: #f8d7da;
          color: #721c24;
        }

        .condition-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-weight: 500;
          color: #333;
        }

        .form-group input {
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
        }

        .form-group input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .submit-btn {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.2s;
        }

        .submit-btn:hover {
          background: #2563eb;
        }

        .submit-btn:disabled {
          background: #93c5fd;
          cursor: not-allowed;
        }

        .conditions-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .empty-state {
          color: #666;
          text-align: center;
          padding: 2rem;
        }

        .condition-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .condition-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .condition-emoji {
          font-size: 1.5rem;
        }

        .condition-name {
          font-weight: 500;
          color: #1a1a1a;
        }

        .condition-actions {
          display: flex;
          gap: 0.5rem;
        }

        .edit-btn, .delete-btn, .save-btn, .cancel-btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: background 0.2s;
        }

        .edit-btn {
          background: #e2e8f0;
          color: #475569;
        }

        .edit-btn:hover {
          background: #cbd5e1;
        }

        .delete-btn {
          background: #fee2e2;
          color: #dc2626;
        }

        .delete-btn:hover {
          background: #fecaca;
        }

        .save-btn {
          background: #22c55e;
          color: white;
        }

        .save-btn:hover {
          background: #16a34a;
        }

        .cancel-btn {
          background: #e2e8f0;
          color: #475569;
        }

        .cancel-btn:hover {
          background: #cbd5e1;
        }

        .edit-form {
          display: flex;
          gap: 1rem;
          width: 100%;
          align-items: center;
        }

        .edit-input {
          flex: 1;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 1rem;
        }

        .edit-actions {
          display: flex;
          gap: 0.5rem;
        }
      `}</style>
    </div>
  );
}
