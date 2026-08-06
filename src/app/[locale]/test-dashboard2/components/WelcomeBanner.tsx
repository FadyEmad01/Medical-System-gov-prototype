export default function WelcomeBanner() {
    return (
        <div
            // Added flex-col-reverse to stack text on top of images on mobile
            className="bg-[#CCE4F0]/50 rounded-sm relative overflow-hidden flex flex-col-reverse md:flex-row items-center w-full p-6 md:p-10"
            dir="rtl"
        >
            {/* Background Images - Positioned on the right */}
            {/* Switched to 'relative' on mobile so images don't cover the text, 'absolute' on desktop */}
            <div className="relative md:absolute bottom-0 right-0 w-full md:w-[55%] pointer-events-none z-0 mt-8 md:mt-0 flex justify-center md:block">
                
                {/* Added items-end so the hospital and family align at their bottoms */}
                <div className="flex items-end justify-center md:justify-start w-[95%] sm:w-[75%] md:w-full">
                    
                    {/* Hospital Image */}
                    {/* Added percentage widths for smooth scaling on mobile */}
                    <img
                        src="/images/h.png"
                        alt="Hospital"
                        className="object-contain object-right-bottom w-[50%] md:w-auto md:max-w-[60%]"
                    />
                    
                    {/* Family Image (Overlapping Hospital) */}
                    {/* Adjusted negative margin to use percentages on mobile for a consistent overlap */}
                    <img
                        src="/images/f.png"
                        alt="Family"
                        className="object-contain object-bottom z-10 -mr-[15%] md:-mx-4 w-[55%] md:w-auto md:max-w-[50%]"
                    />
                </div>
            </div>

            {/* Text Content - Positioned on the left */}
            {/* mr-auto pushes the container to the visual left in RTL mode */}
            <div className="relative z-20 flex flex-col items-start text-right w-full sm:w-3/4 md:w-[45%] mr-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-3 md:mb-4">
                    مرحبًا بك، احمد
                </h1>

                <p className="text-gray-500 text-sm leading-relaxed mb-6 md:mb-8 font-medium text-pretty">
منصة التأمين الصحي الرقمية تسهل عليك الوصول إلي 
الخدمات الحصية وإدارة تأمينك ومواعيدك بكل سهولة.
                </p>

                <button className="bg-[#0077b6] hover:bg-[#005f92] text-white font-semibold px-4.5 py-2.5 rounded-sm text-sm  transition-all mr-auto">
                    استكشف الخدمات
                </button>
            </div>
        </div>
    )
}


// export default function WelcomeBanner() {
//     return (
//         <section
//             // Translated Figma background: bg-[#cce4f0] with opacity-50 and rounded-[9px]
//             // Added flex-col-reverse for responsive mobile stacking
//             className="bg-[#cce4f0]/50 rounded-[9px] relative overflow-hidden flex flex-col-reverse md:flex-row items-center w-full p-6 md:p-8 min-h-auto md:min-h-[238px] font-['Cairo',Helvetica]"
//             dir="rtl"
//             aria-labelledby="dashboard-welcome-heading"
//         >
//             {/* Background Images - Positioned Left in RTL */}
//             <div className="relative md:absolute bottom-0 left-0 w-full md:w-[55%] pointer-events-none z-0 mt-6 md:mt-0 flex justify-center md:justify-end md:pl-8">
                
//                 <div className="flex items-end justify-center md:justify-end w-[90%] sm:w-[75%] md:w-full max-w-[383px]">
//                     {/* Hospital Image (image-20) */}
//                     <img
//                         src="/images/h.png"
//                         alt="مبنى مستشفى"
//                         className="object-contain object-bottom w-[65%] -ml-[15%] md:-ml-[25%] z-0"
//                     />
                    
//                     {/* Man Image (image-40) */}
//                     <img
//                         src="/images/f.png"
//                         alt="رجل"
//                         className="object-contain object-bottom w-[35%] z-10"
//                     />
//                 </div>
//             </div>

//             {/* Text Content - Positioned Right in RTL */}
//             <div className="relative z-20 flex flex-col items-start text-right w-full sm:w-3/4 md:w-[50%] mr-auto">
                
//                 {/* Figma exact heading styling */}
//                 <h2 
//                     id="dashboard-welcome-heading"
//                     className="text-2xl font-bold text-black tracking-[0.48px] leading-[30px] mb-2"
//                 >
//                     مرحباً بك، أحمد
//                 </h2>

//                 {/* Figma exact paragraph styling (Slightly increased text size from 10px to 12px for web readability) */}
//                 <p className="text-[#00000080] font-bold text-[12px] md:text-[13px] tracking-[0.20px] leading-5 mb-6 max-w-[300px]">
//                     يمكنك الآن الوصول إلى <br className="hidden md:block" />
//                     قائمة العيادات الصحية الرئيسية، وإدارة شؤون المرضى بسهولة.
//                 </p>

//                 {/* Figma exact button styling */}
//                 <button 
//                     type="button"
//                     // onClick={handleExploreServices} // Uncomment when logic is ready
//                     className="w-[154px] h-10 bg-[#0077b6] hover:bg-[#005f92] text-white flex items-center justify-center rounded-[9px] font-bold text-[13px] tracking-[0.26px] transition-all shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0077b6]"
//                     aria-label="استكشف الخدمات"
//                 >
//                     استكشف الخدمات
//                 </button>
//             </div>
//         </section>
//     )
// }