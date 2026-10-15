"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      {/* Base UI : "render" conservé à l'identique */}
      <DropdownMenuTrigger render={<Button variant="outline" size="icon" className="border-border/60 hover:bg-[#2664EC]/10 hover:text-[#2664EC] transition-all" />}>
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-[#2664EC]" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-[#2664EC]" />
        <span className="sr-only">Toggle theme</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36 rounded-xl border-border/40 bg-card/95 backdrop-blur-md shadow-xl p-1">
        <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer rounded-lg px-3 py-2 text-sm transition-colors focus:bg-[#2664EC]/10 focus:text-[#2664EC]">
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer rounded-lg px-3 py-2 text-sm transition-colors focus:bg-[#2664EC]/10 focus:text-[#2664EC]">
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer rounded-lg px-3 py-2 text-sm transition-colors focus:bg-[#2664EC]/10 focus:text-[#2664EC]">
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}