import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import bgImage from "@/assets/bg.jpg";
import { RegisterForm } from "@/features/auth/components/register/register-form";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function RegisterPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("auth");

  return (
    <div className="w-full min-h-screen relative">
      <div className="w-full h-96 absolute top-0 z-0">
        <Image
          src={bgImage}
          alt="Register Background"
          fill
          sizes="100vw"
          placeholder="blur"
          className="object-cover object-center"
        />
      </div>

      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 z-[5] h-96 bg-linear-to-b from-[#03045e]/70 via-transparent to-background"
      />

      <div className="w-full h-full relative z-10">
        <div className="text-center text-3xl font-bold mt-30 text-white">
          {t("registerTitle")}
        </div>
        <div className="md:px-20 px-4 max-w-350 mx-auto my-10">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
