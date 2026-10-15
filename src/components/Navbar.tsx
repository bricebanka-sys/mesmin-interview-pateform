import React from 'react'
import { ModeToggle } from './ModeToggle'
import { CodeIcon } from 'lucide-react'
import Link from 'next/link'
import { SignedIn, SignedOut, UserButton, SignInButton } from '@clerk/nextjs'
import DashboardBtn from './DashboardBtn'
import { Button } from './ui/button'

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
  <div className="container mx-auto flex h-16 items-center justify-between px-4">
    {/* GAUCHE : LOGO */}
    <Link
      href="/"
      className="flex items-center gap-2 font-mono text-2xl font-semibold transition-opacity hover:opacity-80"
    >
      <CodeIcon className="size-8 text-blue-500" />
      <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
        Mesmin Recruit
      </span>
    </Link>

    {/* DROITE : ACTIONS */}
    <div className="flex items-center space-x-4 ml-auto">
      <SignedIn>
        <DashboardBtn />

        <ModeToggle />
        <UserButton />

      </SignedIn>
      
      <SignedOut>
        <SignInButton mode="modal">
          <Button variant="default" className="bg-blue-600 hover:bg-blue-700 text-white">Sign in</Button>
        </SignInButton>
      </SignedOut>
    </div>
  </div>
</nav>
  )
}
