"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OnboardingQuestion } from "@/constants/onboarding-questions";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Checkbox } from "./ui/checkbox";

interface CustomFieldRendererProps {
  question: OnboardingQuestion;
  value: any;
  onChange: (value: any) => void;
  index: number;
}

export function CustomFieldRenderer({
  question,
  value,
  onChange,
  index,
}: CustomFieldRendererProps) {
  const renderField = () => {
    switch (question.type) {
      case "text":
        return (
          <Input
            id={question.id}
            value={value || ""}
            onChange={e => onChange(e.target.value)}
            placeholder={question.placeholder}
            className="mt-2 border-white/20 bg-white/10 text-white placeholder:text-white/60"
          />
        );

      case "select":
        return (
          <Select value={value || ""} onValueChange={onChange}>
            <SelectTrigger className="mt-2 border-white/20 bg-white/10 text-white">
              <SelectValue
                placeholder={question.placeholder || "Seleciona uma opção"}
              />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "radio":
        return (
          <RadioGroup
            value={value || ""}
            onValueChange={onChange}
            className="mt-2 space-y-2"
          >
            {question.options?.map(option => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option.value}
                  id={`${question.id}-${option.value}`}
                  className="text-brand-green border-white/40"
                />
                <Label
                  htmlFor={`${question.id}-${option.value}`}
                  className="text-sm text-white/90"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "multiselect":
      case "checkbox":
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="mt-2 space-y-2">
            {question.options?.map(option => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${option.value}`}
                  checked={selectedValues.includes(option.value)}
                  onCheckedChange={checked => {
                    if (checked) {
                      onChange([...selectedValues, option.value]);
                    } else {
                      onChange(
                        selectedValues.filter(
                          (v: string) => v !== option.value,
                        ),
                      );
                    }
                  }}
                  className="border-white/40"
                />
                <Label
                  htmlFor={`${question.id}-${option.value}`}
                  className="text-sm text-white/90"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  const Icon = question.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "space-y-2 rounded-xl border border-white/10 bg-white/5 p-4",
        question.required && "border-[#00cfb1]/30",
      )}
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-[#00cfb1]" />}
        <Label htmlFor={question.id} className="font-medium text-white">
          {question.label}
          {question.required && <span className="ml-1 text-[#00cfb1]">*</span>}
        </Label>
      </div>
      {question.description && (
        <p className="text-xs text-white/60">{question.description}</p>
      )}
      {renderField()}
    </motion.div>
  );
}
