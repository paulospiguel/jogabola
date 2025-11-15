"use client";

import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { countries } from "country-data-list";
import { Check, ChevronsUpDown } from "lucide-react";
import { CircleFlag } from "react-circle-flags";
import { useState } from "react";
import { cn } from "@/utils";

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
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-full border border-white/20 bg-white/10 px-3 py-2 text-sm text-white ring-offset-background placeholder:text-white/60 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-white/20",
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
      <PopoverContent className="w-[300px] p-0 border-white/20 bg-[#2b0071]/95 backdrop-blur shadow-lg" align="start">
        <div className="p-2">
          <Input
            placeholder="Pesquisar país..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="mb-2 border-white/20 bg-white/10 text-white placeholder:text-white/60"
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
                    "relative flex w-full cursor-pointer select-none items-center gap-2 rounded-full px-3 py-2 text-sm text-white outline-none transition-colors hover:bg-white/10",
                    value === country.code && "bg-white/10",
                  )}
                >
                  <CircleFlag
                    countryCode={country.code.toLowerCase()}
                    className="h-4 w-4"
                  />
                  <span className="flex-1 text-left">{country.name}</span>
                  {value === country.code && (
                    <Check className="h-4 w-4 text-[#00cfb1]" />
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

