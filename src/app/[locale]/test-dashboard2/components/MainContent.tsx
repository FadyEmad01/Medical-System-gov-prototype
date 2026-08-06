"use client"

import {
    FileText,
    Users,
    Hospital,
    UserSearch,
    CalendarClock,
    Bell,
    Calendar,
    QrCode,
    CheckCircle2,
    CircleDot,
    Circle,
    Paperclip,
    Building2,
    X,
} from 'lucide-react';
import WelcomeBanner from './WelcomeBanner';

export default function MainContent() {
    const quickServices = [
        { icon: FileText, title: 'المستندات', desc: 'رفع وإدارة مستنداتك' },
        { icon: Users, title: 'إدارة افراد الأسرة', desc: 'إضافة وتعديل الأفراد' },
        { icon: Building2, title: 'العيادات', desc: 'ابحث عن عيادات قريبة منك' },
        { icon: Hospital, title: 'مستشفيات', desc: 'ابحث عن مستشفيات ومراكز طبية' },
        { icon: UserSearch, title: 'بحث عن طبيب', desc: 'ابحث عن طبيب متخصص' },
        { icon: CalendarClock, title: 'حجز موعد', desc: 'احجز موعدك بسهولة' },
    ];

    const notifications = [
        {
            title: 'تأكيد موعد',
            desc: 'تم تأكيد موعدك مع د. أحمد علي',
            time: 'منذ 10 دقائق',
            tone: 'bg-[#d7ebf7]',
            iconTone: 'bg-[#0077b6]/15 text-[#0077b6]',
            icon: Bell,
        },
        {
            title: 'تذكير بالموعد',
            desc: 'لديك موعد غدًا مع د. احمد محمد',
            time: 'منذ 1 ساعة',
            tone: 'bg-[#f4dff7]',
            iconTone: 'bg-[#9d4edd]/15 text-[#9d4edd]',
            icon: Calendar,
        },
        {
            title: 'مستند مرفوض',
            desc: 'تم رفض "شهادة الميلاد"',
            time: 'منذ 3 ساعات',
            tone: 'bg-[#fbe4e4]',
            iconTone: 'bg-[#e63946]/15 text-[#e63946]',
            icon: FileText,
        },
    ];

    const timeline = [
        { title: 'تم تقديم الطلب', date: '20 مايو 2024', done: true },
        { title: 'قيد المراجعة', date: '21 مايو 2024', done: true },
        { title: 'التحقق من المستندات', date: '22 مايو 2024', done: true },
        { title: 'تحت الموافقة النهائية', done: false, active: true },
        { title: 'تم إصدار البطاقة', done: false, muted: true },
    ];

    return (
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_335px] gap-6 h-full items-start" dir="rtl">
            <div className="min-w-0 flex flex-col gap-6">
                <WelcomeBanner />

                <section>
                    <h3 className="mb-4 text-[24px] font-bold leading-[30px] tracking-[0.48px] text-[#03045e] text-right">
                        خدمات سريعة
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
                        {quickServices.map((service) => (
                            <button
                                key={service.title}
                                type="button"
                                className="flex h-[111px] flex-col items-center justify-start rounded-[8px] border border-[rgba(0,0,0,0.1)] bg-white px-3 pt-4 text-center transition-colors hover:bg-[#f7fbfe]"
                            >
                                <service.icon className="mb-2 h-7 w-7 text-[#0077b6]" strokeWidth={1.8} />
                                <h4 className="text-[13px] font-semibold leading-[18px] text-black">
                                    {service.title}
                                </h4>
                                <p className="mt-1 text-[10px] leading-[14px] text-[rgba(0,0,0,0.5)]">
                                    {service.desc}
                                </p>
                            </button>
                        ))}
                    </div>
                </section>

                <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6 items-start">
                    <div className="rounded-[8px] border border-[rgba(0,0,0,0.1)] bg-white p-4 sm:p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-[24px] font-bold leading-[30px] tracking-[0.48px] text-[#03045e]">
                                الموعد القادم
                            </h3>
                            <button type="button" className="text-[13px] font-bold text-[#0077b6] hover:underline">
                                عرض الكل
                            </button>
                        </div>

                        <div className="rounded-[8px] border border-[rgba(0,0,0,0.08)] bg-[#fafafa] p-4">
                            <div className="mb-4 flex items-center gap-4">
                                <div className="size-12 rounded-full bg-[#d9d9d9]" />
                                <div className="min-w-0 flex-1 text-right">
                                    <h4 className="text-[18px] font-bold leading-[20px] text-black">د. أحمد علي</h4>
                                    <p className="mt-1 text-[12px] leading-[18px] text-[rgba(0,0,0,0.55)]">
                                        استشاري أمراض القلب
                                        <br />
                                        مستشفى السلام الدولي - عيادة القلب
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 border-t border-[rgba(0,0,0,0.1)] pt-3 sm:grid-cols-3">
                                <div className="flex items-center gap-1.5 text-[12px] text-[rgba(0,0,0,0.65)]">
                                    <Calendar size={14} className="text-[#0077b6]" />
                                    <span>20 مايو 2024</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[12px] text-[rgba(0,0,0,0.65)] sm:justify-center">
                                    <CalendarClock size={14} className="text-[#0077b6]" />
                                    <span>10:30 ص</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[12px] text-[rgba(0,0,0,0.65)] sm:justify-end">
                                    <Paperclip size={14} className="text-[#0077b6]" />
                                    <span>123-456-678</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <h3 className="mb-4 text-[24px] font-bold leading-[30px] tracking-[0.48px] text-[#03045e]">
                                إحصائيات
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { value: '03', label: 'المواعيد القادمة', icon: CalendarClock },
                                    { value: '08', label: 'افراد الأسرة', icon: Users },
                                    { value: '12', label: 'المستندات المرفوعة', icon: FileText },
                                    { value: '02', label: 'متطلبات قيد المراجعة', icon: CalendarClock },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-center justify-between rounded-[8px] border border-[rgba(0,0,0,0.1)] bg-white px-3 py-3 shadow-[0_0_0_1px_rgba(0,0,0,0.01)]">
                                        <div className="text-right">
                                            <p className="text-[18px] font-bold leading-none text-black">{item.value}</p>
                                            <p className="mt-1 text-[12px] leading-[16px] text-[rgba(0,0,0,0.65)]">{item.label}</p>
                                        </div>
                                        <item.icon className="h-6 w-6 text-[#0077b6]" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[8px] border border-[rgba(0,0,0,0.1)] bg-white p-4 sm:p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-[24px] font-bold leading-[30px] tracking-[0.48px] text-[#03045e]">
                                الإشعارات
                            </h3>
                            <button type="button" className="text-[13px] font-bold text-[#0077b6] hover:underline">
                                عرض الكل
                            </button>
                        </div>

                        <div className="flex flex-col gap-3">
                            {notifications.map((notification) => (
                                <div key={notification.title} className={`relative rounded-[8px] p-3 ${notification.tone}`}>
                                    <button
                                        type="button"
                                        className="absolute left-3 top-3 text-[rgba(0,0,0,0.45)] transition-colors hover:text-black"
                                        aria-label={`إغلاق ${notification.title}`}
                                    >
                                        <X size={16} />
                                    </button>

                                    <div className="flex items-start gap-3 pl-6">
                                        <div className={`flex size-10 shrink-0 items-center justify-center rounded-[8px] ${notification.iconTone}`}>
                                            <notification.icon size={18} />
                                        </div>
                                        <div className="min-w-0 text-right">
                                            <h4 className="text-[14px] font-bold leading-[20px] text-black">{notification.title}</h4>
                                            <p className="text-[12px] leading-[18px] text-[rgba(0,0,0,0.65)]">{notification.desc}</p>
                                            <span className="mt-1 block text-[10px] leading-[14px] text-[rgba(0,0,0,0.35)]">
                                                {notification.time}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>

            <div className="w-full xl:w-[335px] flex flex-col gap-6 shrink-0">
                <div className="rounded-[8px] border border-[rgba(0,0,0,0.1)] bg-white p-4 sm:p-5">
                    <div className="mb-4 flex items-center justify-end">
                        <h3 className="text-[24px] font-bold leading-[30px] tracking-[0.48px] text-[#03045e]">
                            بطاقتي التأمينية
                        </h3>
                    </div>

                    <div className="relative overflow-hidden rounded-[8px] bg-[#03045e] p-4 text-white shadow-[0_10px_24px_rgba(3,4,94,0.14)]">
                        <div className="pointer-events-none absolute inset-0 opacity-60">
                            <div className="absolute left-0 top-0 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
                            <div className="absolute right-0 bottom-0 h-28 w-28 rounded-full bg-[#00b4d8]/15 blur-2xl" />
                        </div>

                        <div className="relative z-10 flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2 text-white/90">
                                <Hospital size={28} />
                                <div className="text-right text-[11px] leading-[15px]">
                                    <div>الهيئة العامة</div>
                                    <div>للتأمين الصحي الشامل</div>
                                </div>
                            </div>
                            <div className="rounded-[8px] bg-white p-1 text-black">
                                <QrCode size={50} />
                            </div>
                        </div>

                        <div className="relative z-10 mt-5 text-[20px] leading-[20px] tracking-[0.4px] text-white" dir="ltr">
                            1234 5678 9012 3456
                        </div>

                        <div className="relative z-10 mt-5 flex items-end justify-between gap-3">
                            <div className="text-right">
                                <p className="text-[10px] leading-[14px] text-[#dfe3e7]">الاسم</p>
                                <p className="text-[14px] font-semibold leading-[20px] text-white">احمد محمد علي</p>
                                <p className="mt-3 text-[10px] leading-[14px] text-[#dfe3e7]">الحالة</p>
                                <p className="text-[14px] font-semibold leading-[20px] text-white">نشطة</p>
                            </div>
                            <div className="rounded-[8px] border border-white/10 bg-white/5 px-2 py-1 text-right">
                                <div className="text-[11px] font-semibold leading-[14px] text-white/90">رقم الموعد</div>
                                <div className="mt-1 text-[11px] leading-[14px] text-white/80">123-456-678</div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                        <div className="text-right text-[11px] leading-[16px] text-[rgba(0,0,0,0.55)]">
                            <div>صالحة حتى</div>
                            <div className="text-[12px] font-semibold text-[rgba(0,0,0,0.75)]">20 مايو 2026</div>
                        </div>
                        <button
                            type="button"
                            className="rounded-[8px] bg-[rgba(0,119,182,0.2)] px-4 py-2 text-[11px] font-bold leading-[16px] text-[#03045e] transition-colors hover:bg-[rgba(0,119,182,0.28)]"
                        >
                            عرض البطاقة
                        </button>
                    </div>
                </div>

                <div className="flex-1 rounded-[8px] border border-[rgba(0,0,0,0.1)] bg-white p-4 sm:p-5">
                    <h3 className="mb-5 text-[24px] font-bold leading-[30px] tracking-[0.48px] text-[#03045e]">
                        حالة طلب التأمين
                    </h3>

                    <div className="relative pr-4">
                        {/* Continuous line perfectly centered through the 28px icons (16px padding + 13.5px half-width = 29.5px) */}
                        <div className="absolute right-[29.5px] top-3.5 bottom-3.5 w-px bg-[rgba(0,0,0,0.18)]" />

                        <div className="flex flex-col gap-5">
                            {timeline.map((step) => (
                                <div key={step.title} className={`relative flex items-start gap-4 ${step.muted ? 'opacity-50' : ''}`}>
                                    <div className="relative z-10 shrink-0 rounded-full bg-white">
                                        {step.done ? (
                                            <CheckCircle2 className="text-[#18b918]" size={28} />
                                        ) : step.active ? (
                                            <CircleDot className="text-[#03045e]" size={28} />
                                        ) : (
                                            <Circle className="text-[rgba(0,0,0,0.45)]" size={28} />
                                        )}
                                    </div>
                                    <div className="min-w-0 text-right pt-0.5">
                                        <h4 className={`text-[14px] font-semibold leading-[20px] ${step.active ? 'text-[#03045e]' : 'text-black'}`}>
                                            {step.title}
                                        </h4>
                                        {step.date ? (
                                            <p className="text-[12px] leading-[16px] text-[rgba(0,0,0,0.45)]">{step.date}</p>
                                        ) : null}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}