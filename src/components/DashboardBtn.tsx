"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SparklesIcon } from "lucide-react"
import { useUserRole } from "@/hooks/useUserRole";


function DashboardBtn() {

  const { isCandidate, isLoading } = useUserRole();

  // Un candidat n'a pas besoin d'accéder au dashboard recruteur
  if (isCandidate || isLoading) return null;

  return (
    <Button
      asChild
      size="sm"
      className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-colors"
    >
      <Link href="/dashboard">
        <SparklesIcon className="size-4" />
        Dashboard
      </Link>
    </Button>
  );
}

export default DashboardBtn