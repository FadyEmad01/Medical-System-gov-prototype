// "use client"

// import React from 'react';
// import {
//     Home,
//     Hospital,
//     Stethoscope,
//     Users,
//     CreditCard,
//     FileText,
//     Bell,
//     Settings,
//     HelpCircle,
//     LogOut
// } from 'lucide-react';

// import {
//     Sidebar,
//     SidebarContent,
//     SidebarFooter,
//     SidebarGroup,
//     SidebarGroupContent,
//     SidebarMenu,
//     SidebarMenuButton,
//     SidebarMenuItem,
// } from "@/components/ui/sidebar"

// export default function Asidebar() {
//     const menuItems = [
//         { icon: Home, label: 'الرئيسية', active: true },
//         { icon: Hospital, label: 'المستشفيات', active: false },
//         { icon: Stethoscope, label: 'الأطباء', active: false },
//         { icon: Users, label: 'التأمين وافراد العائلة', active: false },
//         { icon: CreditCard, label: 'بطاقتي التأمينية', active: false },
//         { icon: FileText, label: 'المستندات', active: false },
//         { icon: Bell, label: 'الإشعارات', active: false },
//         { icon: Settings, label: 'الإعدادات', active: false },
//         { icon: HelpCircle, label: 'مركز المساعدة', active: false },
//     ];

//     return (
//         <Sidebar side="right" className="border-l border-black/10 bg-white">
//             <SidebarContent className="bg-white p-2">
//                 <SidebarGroup>
//                     <SidebarGroupContent>
//                         <SidebarMenu className="gap-1.5">
//                             {menuItems.map((item, index) => (
//                                 <SidebarMenuItem key={index}>
//                                     <SidebarMenuButton
//                                         isActive={item.active}
//                                         className={`w-full justify-start gap-3 px-4 py-6 text-sm sm:text-base rounded-lg transition-colors ${item.active
//                                                 ? 'bg-[#cce6ff] text-[#0066cc] font-bold hover:bg-[#b8dcff] hover:text-[#0066cc]'
//                                                 : 'text-gray-600 hover:bg-gray-50'
//                                             }`}
//                                     >
//                                         <item.icon className={`size-5 ${item.active ? "text-[#0066cc]" : "text-gray-500"}`} />
//                                         <span>{item.label}</span>
//                                     </SidebarMenuButton>
//                                 </SidebarMenuItem>
//                             ))}
//                         </SidebarMenu>
//                     </SidebarGroupContent>
//                 </SidebarGroup>
//             </SidebarContent>

//             <SidebarFooter className="bg-white p-4 border-t border-black/10">
//                 <SidebarMenu>
//                     <SidebarMenuItem>
//                         <SidebarMenuButton
//                             className="w-full justify-start gap-3 px-4 py-6 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg font-bold"
//                         >
//                             <LogOut className="size-5 text-red-500" />
//                             <span>تسجيل الخروج</span>
//                         </SidebarMenuButton>
//                     </SidebarMenuItem>
//                 </SidebarMenu>
//             </SidebarFooter>
//         </Sidebar>
//     );
// }

"use client"

import React from 'react';
import { 
    Home, 
    Hospital, 
    Stethoscope, 
    Users, 
    CreditCard, 
    FileText, 
    Bell, 
    Settings, 
    HelpCircle, 
    LogOut 
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export default function Asidebar() {
    const menuItems = [
        { icon: Home, label: 'الرئيسية', active: true },
        { icon: Hospital, label: 'المستشفيات', active: false },
        { icon: Stethoscope, label: 'الأطباء', active: false },
        { icon: Users, label: 'التأمين وافراد العائلة', active: false },
        { icon: CreditCard, label: 'بطاقتي التأمينية', active: false },
        { icon: FileText, label: 'المستندات', active: false },
        { icon: Bell, label: 'الإشعارات', active: false },
        { icon: Settings, label: 'الإعدادات', active: false },
        { icon: HelpCircle, label: 'مركز المساعدة', active: false },
    ];

    return (
        <Sidebar 
            side="right" 
            className="top-[73px] h-[calc(100vh-73px)] border-l border-black/10 bg-white"
        >
            <SidebarContent className="bg-white p-2 pt-4 sm:pt-6">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-1.5">
                            {menuItems.map((item, index) => (
                                <SidebarMenuItem key={index}>
                                    <SidebarMenuButton 
                                        isActive={item.active}
                                        className={`w-full justify-start gap-3 px-4 py-5 text-sm sm:text-base rounded-sm transition-colors ${
                                            item.active 
                                                ? 'bg-[#00B4D880]/50! text-black/50! font-bold hover:bg-[#b8dcff]' 
                                                : 'text-black/50! hover:bg-gray-50'
                                        }`}
                                    >
                                        <item.icon className={`size-5 ${item.active ? "text-black/50" : "text-black/50"}`} />
                                        <span>{item.label}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="bg-white p-4 border-t border-black/10">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton 
                            className="w-full justify-start gap-3 px-4 py-5 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-sm font-bold"
                        >
                            <LogOut className="size-5 text-red-500" />
                            <span>تسجيل الخروج</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}