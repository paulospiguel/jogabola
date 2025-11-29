"use client";

import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/utils";
import { countries } from "country-data-list";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { CircleFlag } from "react-circle-flags";

interface Country {
  code: string;
  name: string;
}

// Mapeamento de nomes em inglês para português (principais países)
const countryNamesPT: Record<string, string> = {
  "Portugal": "Portugal",
  "Brazil": "Brasil",
  "Angola": "Angola",
  "Mozambique": "Moçambique",
  "Cape Verde": "Cabo Verde",
  "Guinea-Bissau": "Guiné-Bissau",
  "São Tomé and Príncipe": "São Tomé e Príncipe",
  "Spain": "Espanha",
  "France": "França",
  "Italy": "Itália",
  "Germany": "Alemanha",
  "United Kingdom": "Reino Unido",
  "United States": "Estados Unidos",
  "Canada": "Canadá",
  "Argentina": "Argentina",
  "Mexico": "México",
  "Chile": "Chile",
  "Colombia": "Colômbia",
  "Peru": "Peru",
  "Uruguay": "Uruguai",
  "Venezuela": "Venezuela",
  "Ecuador": "Equador",
  "Paraguay": "Paraguai",
  "Bolivia": "Bolívia",
  // Adicionar mais conforme necessário
};

// Converter dados de country-data-list para nosso formato
const getCountries = (): Country[] => {
  return countries.all
    .map(country => {
      const name = countryNamesPT[country.name] || country.name;
      return {
        code: country.alpha2,
        name: name,
      };
    })
    .filter(country => country.code && country.name && country.code.length === 2)
    .sort((a, b) => a.name.localeCompare(b.name, "pt"));
};

interface CountrySelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function CountrySelector({
  value,
  onValueChange,
  placeholder = "Seleciona um país",
  className,
}: CountrySelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const countriesList = getCountries();
  const selectedCountry = countriesList.find(c => c.code === value);

  const filteredCountries = countriesList.filter(country =>
    country.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-controls="country-selector-list"
          aria-haspopup="listbox"
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-full border border-white/8 bg-white/5 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder:text-white/60 transition-all duration-300 focus-visible:outline-hidden focus-visible:ring-[3px] focus-visible:ring-neon-primary/40 disabled:cursor-not-allowed disabled:opacity-50 hover:border-neon-primary/50 hover:bg-white/10",
            className,
          )}
        >
          <div className="flex items-center gap-2">
            {selectedCountry ? (
              <>
                <CircleFlag
                  countryCode={selectedCountry.code.toLowerCase()}
                  className="h-4 w-4"
                />
                <span>{selectedCountry.name}</span>
              </>
            ) : (
              <span className="text-white/60">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent id="country-selector-list" className="w-[300px] border-white/10 bg-toast-bg/95 text-white backdrop-blur-xl shadow-[0_35px_80px_-45px_rgba(36,255,230,0.8)] rounded-2xl" align="start">
        <div className="p-2">
          <Input
            placeholder="Pesquisar país..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="mb-2 rounded-full border border-neon-primary/30 bg-white/5 text-white placeholder:text-white/60 focus-visible:border-neon-primary focus-visible:ring-[3px] focus-visible:ring-neon-primary/40"
          />
        </div>
        <div className="max-h-[300px] overflow-auto">
          {filteredCountries.length === 0 ? (
            <div className="p-4 text-center text-sm text-white/60">
              Nenhum país encontrado.
            </div>
          ) : (
            <div className="p-1">
              {filteredCountries.map(country => (
                <button
                  key={country.code}
                  onClick={() => {
                    onValueChange(country.code);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={cn(
                    "relative flex w-full cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2 text-sm text-white outline-none transition-all duration-200 hover:bg-white/10",
                    value === country.code && "bg-neon-primary/10 border-l-2 border-neon-primary",
                  )}
                >
                  <CircleFlag
                    countryCode={country.code.toLowerCase()}
                    className="h-4 w-4"
                  />
                  <span className="flex-1 text-left">{country.name}</span>
                  {value === country.code && (
                    <Check className="h-4 w-4 text-neon-primary" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

