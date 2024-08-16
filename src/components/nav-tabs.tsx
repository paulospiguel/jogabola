"use client";

import { motion } from "framer-motion";
import type React from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ImageIcon = React.ReactNode;

interface TabProps {
  text: string;
  selected: boolean;
  setSelected: React.Dispatch<React.SetStateAction<string>>;
  icon?: ImageIcon;
}

type NavTabsProps = {
  label: string;
  icon?: ImageIcon;
};

export default function NavTabs({ tabs }: { tabs: NavTabsProps[] }) {
  const [selected, setSelected] = useState<string>(tabs[0].label);

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 rounded-md bg-violet-950 p-6">
      {tabs.map((tab) => (
        <Tab
          icon={tab.icon}
          text={tab.label}
          selected={selected === tab.label}
          setSelected={setSelected}
          key={tab.label}
        />
      ))}
    </div>
  );
}

const Tab = ({ text, selected, setSelected, icon }: TabProps) => {
  const renderIcon = icon;
  return (
    <Button
      variant="ghost"
      onClick={() => setSelected(text)}
      className={cn(
        "relative rounded-md p-2 text-sm transition-all",
        selected ? "text-white" : "text-slate-300 hover:font-black"
      )}
    >
      <p className="relative z-50 min-w-20 flex items-center gap-2">
        {renderIcon}
        {text}
      </p>
      {selected && (
        <motion.span
          layoutId="tabs"
          transition={{ type: "spring", duration: 0.5 }}
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-600 to-gray-600"
        />
      )}
    </Button>
  );
};
