"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ListChecks, 
  Plus, 
  Pencil, 
  Trash2, 
  Check, 
  X, 
  Sparkles, 
  Wrench, 
  Package, 
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";

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

  const getConditionIcon = (description: string) => {
    const lower = description.toLowerCase();
    if (lower.includes("new")) return <Sparkles className="h-5 w-5 text-green-500" />;
    if (lower.includes("repair")) return <Wrench className="h-5 w-5 text-orange-500" />;
    if (lower.includes("retired")) return <Package className="h-5 w-5 text-gray-500" />;
    if (lower.includes("missing")) return <HelpCircle className="h-5 w-5 text-red-500" />;
    return <ListChecks className="h-5 w-5 text-blue-500" />;
  };

  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <header className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <ListChecks className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Defined Conditions</h1>
        </div>
        <p className="text-muted-foreground">Manage asset condition types</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {/* Add New Condition */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 border-b-2 border-primary pb-2">
              <Plus className="h-5 w-5" />
              Add New Condition
            </CardTitle>
          </CardHeader>
          <CardContent>
            {message && (
              <Alert 
                variant={message.type === "error" ? "destructive" : "default"} 
                className={`mb-4 ${message.type === "success" ? "border-green-500 text-green-700 bg-green-50" : ""}`}
              >
                {message.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold">
                  Condition Name
                </Label>
                <Input
                  type="text"
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Good, Fair, Excellent"
                  required
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Add Condition
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Existing Conditions */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 border-b-2 border-primary pb-2">
              <ListChecks className="h-5 w-5" />
              Existing Conditions
              <Badge variant="secondary" className="ml-auto">{conditions.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {conditions.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <ListChecks className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No conditions defined yet. Add one to get started!</p>
                </div>
              ) : (
                conditions.map((condition) => (
                  <div 
                    key={condition.id} 
                    className="flex justify-between items-center p-4 bg-muted/50 rounded-lg border border-border"
                  >
                    {editingId === condition.id ? (
                      <div className="flex gap-3 w-full items-center">
                        <Input
                          type="text"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="flex-1"
                        />
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleUpdate(condition.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setEditingId(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          {getConditionIcon(condition.description)}
                          <span className="font-medium text-foreground">{condition.description}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEdit(condition)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDelete(condition.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
