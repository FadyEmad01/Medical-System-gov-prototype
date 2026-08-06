"use client"

import React from 'react'
import Navbar from './components/Navbar'
import Asidebar from './components/Asidebar'
import MainContent from './components/MainContent'
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F3F4F6] font-sans" dir="rtl">
      {/* 1. Full-width sticky header at the top */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-black/10">
        <Navbar />
      </header>

      {/* 2. Body section (Sidebar + Content) below the header */}
      <SidebarProvider defaultOpen={true} className="flex-1">
        <div className="flex flex-1 w-full max-w-[1600px] mx-auto min-h-[calc(100vh-73px)]">
          {/* Right Navigation Sidebar */}
          <Asidebar />

          {/* Center + Left Dashboard Content */}
          <SidebarInset className="flex-1 bg-white p-4 sm:p-6 overflow-y-auto">
            <MainContent />
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}