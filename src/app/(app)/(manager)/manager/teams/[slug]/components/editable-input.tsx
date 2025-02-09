"use client";

import { useEffect, useState } from "react";
import { Check, Pen } 
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EditableInputProps {
  initialValue: string | undefined;
  onSave: (value: string) => void;
  type?: "number" | "text" | "date";
}

export default function EditableInput({
  initialValue = "",
  type = "text",
  onSave,
}: EditableInputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState<string | undefined>(initialValue);

  const handleToggleEdit = () => {
    if (isEditing) {
      const saveValue = value ?? "";
      onSave(saveValue);
    }
    setIsEditing(!isEditing);
  };

  useEffect(() => {
    setValue(initialValue);

    return () => {
      setValue(undefined);
    };
  }, [initialValue]);

  return (
    <div className="flex items-center space-x-2">
      {isEditing ? (
        <Input
          placeholder="N/A"
          type={type}
          value={value}
          onChange={e => setValue(e.target.value)}
          className="h-8 flex-grow border"
          autoFocus
        />
      ) : (
        <span className="flex-grow">{value || "N/A"}</span>
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggleEdit}
        aria-label={isEditing ? "Save" : "Edit"}
      >
        {isEditing ? (
          <Check className="h-4 w-4" />
        ) : (
          <Pen className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
