// "use client"

// import FamilyIcon from '@iconify-react/mdi/family';
// import { Search } from 'lucide-react';

// export default function Navbar() {
//     return (
//         <div className='w-full border-b border-black/10'>
//             <div className='px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap md:flex-nowrap items-center md:justify-between gap-3 md:gap-4'>
//                 {/* Logo + (mobile-only) avatar share the first row on small screens */}
//                 <div className='flex items-center justify-between w-full md:w-auto'>
//                     <Logo />
//                     <div className='md:hidden'>
//                         <UserComponent compact />
//                     </div>
//                 </div>

//                 {/* Search: full width row on mobile, fixed-ish width on desktop, spread out by justify-between */}
//                 <div className='w-full md:w-72 lg:w-96'>
//                     <SearchComponent />
//                 </div>

//                 {/* Full user card, desktop only */}
//                 <div className='hidden md:flex'>
//                     <UserComponent />
//                 </div>
//             </div>
//         </div>
//     )
// }

// function Logo() {
//     return (
//         <div className='flex items-center gap-2 text-black shrink-0'>
//             <FamilyIcon height="32" className='sm:h-10 sm:w-10' />
//             <span className='text-xl sm:text-2xl font-bold whitespace-nowrap'>التأمين الصحي</span>
//         </div>
//     )
// }

// function SearchComponent() {
//     return (
//         <div className='flex items-center gap-2 border border-black/10 rounded-sm px-3 sm:px-4 py-2 text-black/45 font-bold w-full'>
//             <input
//                 type="text"
//                 placeholder='ابحث عن مستشفى, طبيب, خدمة...'
//                 className='outline-none flex-1 min-w-0 bg-transparent text-sm sm:text-base'
//             />
//             <Search className='shrink-0' size={20} />
//         </div>
//     )
// }

// function UserComponent({ compact = false }: { compact?: boolean }) {
//     return (
//         <div className='flex items-center gap-2 text-black'>
//             {!compact && (
//                 <div className='hidden md:flex flex-col items-end'>
//                     <span className='text-lg font-bold whitespace-nowrap'>أحمد محمد علي</span>
//                     <span className='text-sm text-black/60 whitespace-nowrap'>مرحبًا بك مرة اخرى</span>
//                 </div>
//             )}
//             <img
//                 src="https://i.pravatar.cc/150"
//                 alt="user"
//                 className='size-10 sm:size-12 rounded-full shrink-0'
//             />
//         </div>
//     )
// }

"use client"

import { useState } from 'react';
import FamilyIcon from '@iconify-react/mdi/family';
import { Search, Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Navbar() {
    return (
        <div className='w-full border-b border-black/10'>
            <div className='px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap md:flex-nowrap items-center md:justify-between gap-3 md:gap-4'>
                {/* Logo + (mobile-only) avatar share the first row on small screens */}
                <div className='flex items-center justify-between w-full md:w-auto'>
                    <Logo />
                    <div className='md:hidden'>
                        <UserComponent compact />
                    </div>
                </div>

                {/* Search & Language Select */}
                {/* <div className='flex items-center gap-2 w-full md:w-auto flex-1 max-w-md lg:max-w-xl'> */}
                <div className='flex items-center gap-2 w-full md:w-auto flex-1 max-w-fill lg:max-w-xl'>
                    <div className='flex-1'>
                        <SearchComponent />
                    </div>
                    <LanguageSelect />
                </div>

                {/* Full user card, desktop only */}
                <div className='hidden md:flex shrink-0'>
                    <UserComponent />
                </div>
            </div>
        </div>
    )
}

function Logo() {
    return (
        <div className='flex items-center gap-2 text-black shrink-0'>
            <FamilyIcon height="32" className='sm:h-10 sm:w-10' />
            <span className='text-xl sm:text-2xl font-bold whitespace-nowrap'>التأمين الصحي</span>
        </div>
    )
}

function SearchComponent() {
    return (
        <div className='flex items-center gap-2 border border-black/10 rounded-sm px-3 sm:px-4 py-2 text-black/45 font-bold w-full h-10 sm:h-11'>
            <input
                type="text"
                placeholder='ابحث عن مستشفى, طبيب, خدمة...'
                className='outline-none flex-1 min-w-0 bg-transparent text-sm sm:text-base text-black'
            />
            <Search className='shrink-0' size={20} />
        </div>
    )
}

function LanguageSelect() {
    const [lang, setLang] = useState('ar');

    return (
        <Select value={lang} onValueChange={setLang}>
            <SelectTrigger className="[&>svg]:hidden border-none shadow-none rounded-sm h-10 sm:h-11 font-bold text-black focus:ring-0 focus:ring-offset-0">
                <div className="flex items-center gap-2"> 
                    <SelectValue placeholder="Language" />
                    <Globe className="h-4 w-4 shrink-0 text-black/70" />
                </div>
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="ar" className="font-bold">العربية</SelectItem>
                <SelectItem value="en" className="font-bold">English</SelectItem>
            </SelectContent>
        </Select>
    )
}

function UserComponent({ compact = false }: { compact?: boolean }) {
    return (
        <div className='flex items-center gap-2 text-black'>
            {!compact && (
                <div className='hidden md:flex flex-col items-end'>
                    <span className='text-lg font-bold whitespace-nowrap'>أحمد محمد علي</span>
                    <span className='text-sm text-black/60 whitespace-nowrap'>مرحبًا بك مرة اخرى</span>
                </div>
            )}
            <img
                src="https://i.pravatar.cc/150"
                alt="user"
                className='size-10 sm:size-12 rounded-full shrink-0'
            />
        </div>
    )
}