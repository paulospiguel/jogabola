"use client";

import { Input } from "@/components/ui/input";
import { Search } 

export const InputSearch = () => {
  return (
    <form className="max-w-screen mx-auto w-full flex-1 px-4 sm:flex-initial">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Pesquisa..."
          className="rounded-full pl-8 sm:w-[300px] md:w-[200px] lg:w-full"
        />
      </div>
    </form>
  );
};
