"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { type AnimationEvent, useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  GENDER_OPTIONS,
  GOVERNORATE_OPTIONS,
} from "@/features/auth/constants/register-options";
import { useAuth } from "@/features/auth/hooks/use-auth";
import type { RegisterRequest } from "@/features/auth/types";
import {
  REQUIRED_FIELDS,
  type RegisterFormData,
  registerFormSchema,
} from "@/features/auth/validation/register-form";
import { useRouter } from "@/i18n/navigation";

export function RegisterForm() {
  const t = useTranslations("auth");
  const errorText = (msg?: string) =>
    msg && t.has(msg) ? t(msg) : (msg ?? "");
  const router = useRouter();
  const { register: authRegister } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    mode: "onChange",
    defaultValues: {
      nationalId: "",
      firstName: "",
      secondName: "",
      thirdName: "",
      fourthName: "",
      dateOfBirth: "",
      gender: undefined,
      mobileNumber: "",
      governorate: "",
      district: "",
      address: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const {
    register,
    setValue,
    watch,
    formState: { errors, isValid },
  } = form;

  const values = watch();
  // Defense-in-depth: isValid already reflects the whole-form parse; requiredComplete
  // guards the no-events-autofill / untouched-field edge cases.
  const requiredComplete = REQUIRED_FIELDS.every((key) => {
    const value = values[key];
    return typeof value === "string"
      ? value.trim() !== ""
      : value !== undefined;
  });

  // Re-validate confirmPassword whenever password changes: RHF only updates the
  // changed field's error slot, so the mismatch error would otherwise go stale.
  const passwordValue = watch("password");
  useEffect(() => {
    if (passwordValue) form.trigger("confirmPassword");
  }, [passwordValue, form]);

  // Browsers/password managers can autofill inputs without firing input events,
  // so RHF's internal store never syncs. Sync the DOM value on the autofill
  // animation start so requiredComplete/isValid can flip the submit button.
  type AutofillFieldName = Exclude<
    keyof RegisterFormData,
    "gender" | "governorate"
  >;
  const handleAutofill =
    (name: AutofillFieldName) => (event: AnimationEvent<HTMLInputElement>) => {
      const value = event.currentTarget.value;
      if (value === "") return;
      form.setValue(name, value, { shouldValidate: true });
    };

  const handleSubmit = useCallback(async () => {
    const valid = await form.trigger();
    if (!valid) return;

    setIsSubmitting(true);
    try {
      const data = form.getValues();
      const { confirmPassword: _, email: rawEmail, ...rest } = data;

      const payload: RegisterRequest = {
        ...rest,
        email: rawEmail || undefined,
      };

      const result = await authRegister(payload);

      if (result.success) {
        toast.success(t("registerSuccess"));
        router.push("/");
      } else {
        toast.error(result.error);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("registerError");
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  }, [form, authRegister, router, t]);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="flex flex-col gap-6">
        <FieldGroup>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* National ID */}
            <Field
              data-invalid={!!errors.nationalId || undefined}
              className="md:col-span-1"
            >
              <FieldLabel htmlFor="nationalId">
                {t("nationalId")} <span className="text-destructive">*</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="nationalId"
                  placeholder="XXXXXXXXXXXXXX"
                  {...register("nationalId")}
                  onAnimationStart={handleAutofill("nationalId")}
                  aria-invalid={!!errors.nationalId || undefined}
                />
                {errors.nationalId?.message && (
                  <FieldError>
                    {errorText(errors.nationalId?.message)}
                  </FieldError>
                )}
              </FieldContent>
            </Field>

            {/* Names */}
            <div className="grid grid-cols-1 gap-6 md:col-span-3 md:grid-cols-4">
              <Field data-invalid={!!errors.firstName || undefined}>
                <FieldLabel htmlFor="firstName">
                  {t("firstName")} <span className="text-destructive">*</span>
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="firstName"
                    {...register("firstName")}
                    onAnimationStart={handleAutofill("firstName")}
                    aria-invalid={!!errors.firstName || undefined}
                  />
                  {errors.firstName?.message && (
                    <FieldError>
                      {errorText(errors.firstName?.message)}
                    </FieldError>
                  )}
                </FieldContent>
              </Field>

              <Field data-invalid={!!errors.secondName || undefined}>
                <FieldLabel htmlFor="secondName">
                  {t("secondName")} <span className="text-destructive">*</span>
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="secondName"
                    {...register("secondName")}
                    onAnimationStart={handleAutofill("secondName")}
                    aria-invalid={!!errors.secondName || undefined}
                  />
                  {errors.secondName?.message && (
                    <FieldError>
                      {errorText(errors.secondName?.message)}
                    </FieldError>
                  )}
                </FieldContent>
              </Field>

              <Field data-invalid={!!errors.thirdName || undefined}>
                <FieldLabel htmlFor="thirdName">
                  {t("thirdName")} <span className="text-destructive">*</span>
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="thirdName"
                    {...register("thirdName")}
                    onAnimationStart={handleAutofill("thirdName")}
                    aria-invalid={!!errors.thirdName || undefined}
                  />
                  {errors.thirdName?.message && (
                    <FieldError>
                      {errorText(errors.thirdName?.message)}
                    </FieldError>
                  )}
                </FieldContent>
              </Field>

              <Field data-invalid={!!errors.fourthName || undefined}>
                <FieldLabel htmlFor="fourthName">
                  {t("fourthName")} <span className="text-destructive">*</span>
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="fourthName"
                    {...register("fourthName")}
                    onAnimationStart={handleAutofill("fourthName")}
                    aria-invalid={!!errors.fourthName || undefined}
                  />
                  {errors.fourthName?.message && (
                    <FieldError>
                      {errorText(errors.fourthName?.message)}
                    </FieldError>
                  )}
                </FieldContent>
              </Field>
            </div>

            {/* Date of Birth */}
            <Field
              data-invalid={!!errors.dateOfBirth || undefined}
              className="md:col-span-1"
            >
              <FieldLabel htmlFor="dateOfBirth">
                {t("dateOfBirth")} <span className="text-destructive">*</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="dateOfBirth"
                  type="date"
                  {...register("dateOfBirth")}
                  onAnimationStart={handleAutofill("dateOfBirth")}
                  aria-invalid={!!errors.dateOfBirth || undefined}
                />
                {errors.dateOfBirth?.message && (
                  <FieldError>
                    {errorText(errors.dateOfBirth?.message)}
                  </FieldError>
                )}
              </FieldContent>
            </Field>

            {/* Gender */}
            <Field
              data-invalid={!!errors.gender || undefined}
              className="md:col-span-1"
            >
              <FieldLabel>
                {t("gender")} <span className="text-destructive">*</span>
              </FieldLabel>
              <FieldContent>
                <Select
                  value={watch("gender")}
                  onValueChange={(v) =>
                    setValue("gender", v as "Male" | "Female", {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger
                    className="w-full"
                    aria-invalid={!!errors.gender || undefined}
                  >
                    <SelectValue placeholder={t("gender")} />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {t(option.label)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.gender?.message && (
                  <FieldError>{errorText(errors.gender?.message)}</FieldError>
                )}
              </FieldContent>
            </Field>

            {/* Mobile Number */}
            <Field
              data-invalid={!!errors.mobileNumber || undefined}
              className="md:col-span-1"
            >
              <FieldLabel htmlFor="mobileNumber">
                {t("mobileNumber")} <span className="text-destructive">*</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="mobileNumber"
                  placeholder="01XXXXXXXXX"
                  {...register("mobileNumber")}
                  onAnimationStart={handleAutofill("mobileNumber")}
                  aria-invalid={!!errors.mobileNumber || undefined}
                />
                {errors.mobileNumber?.message && (
                  <FieldError>
                    {errorText(errors.mobileNumber?.message)}
                  </FieldError>
                )}
              </FieldContent>
            </Field>

            {/* Governorate */}
            <Field
              data-invalid={!!errors.governorate || undefined}
              className="md:col-span-1"
            >
              <FieldLabel>
                {t("governorate")} <span className="text-destructive">*</span>
              </FieldLabel>
              <FieldContent>
                <Select
                  value={watch("governorate")}
                  onValueChange={(v) =>
                    setValue("governorate", v, { shouldValidate: true })
                  }
                >
                  <SelectTrigger
                    className="w-full"
                    aria-invalid={!!errors.governorate || undefined}
                  >
                    <SelectValue placeholder={t("governorate")} />
                  </SelectTrigger>
                  <SelectContent>
                    {GOVERNORATE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {t(option.label)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.governorate?.message && (
                  <FieldError>
                    {errorText(errors.governorate?.message)}
                  </FieldError>
                )}
              </FieldContent>
            </Field>

            {/* District */}
            <Field
              data-invalid={!!errors.district || undefined}
              className="md:col-span-1"
            >
              <FieldLabel htmlFor="district">
                {t("district")} <span className="text-destructive">*</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="district"
                  {...register("district")}
                  onAnimationStart={handleAutofill("district")}
                  aria-invalid={!!errors.district || undefined}
                />
                {errors.district?.message && (
                  <FieldError>{errorText(errors.district?.message)}</FieldError>
                )}
              </FieldContent>
            </Field>

            {/* Email */}
            <Field
              data-invalid={!!errors.email || undefined}
              className="md:col-span-1"
            >
              <FieldLabel htmlFor="email">
                {t("email")}{" "}
                <span className="text-xs text-muted-foreground">
                  ({t("optional")})
                </span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  onAnimationStart={handleAutofill("email")}
                  aria-invalid={!!errors.email || undefined}
                />
                {errors.email?.message && (
                  <FieldError>{errorText(errors.email?.message)}</FieldError>
                )}
              </FieldContent>
            </Field>

            {/* Address */}
            <Field
              data-invalid={!!errors.address || undefined}
              className="md:col-span-3"
            >
              <FieldLabel htmlFor="address">
                {t("address")} <span className="text-destructive">*</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="address"
                  {...register("address")}
                  onAnimationStart={handleAutofill("address")}
                  aria-invalid={!!errors.address || undefined}
                />
                {errors.address?.message && (
                  <FieldError>{errorText(errors.address?.message)}</FieldError>
                )}
              </FieldContent>
            </Field>

            {/* Username */}
            <Field
              data-invalid={!!errors.username || undefined}
              className="md:col-span-1"
            >
              <FieldLabel htmlFor="username">
                {t("username")} <span className="text-destructive">*</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="username"
                  {...register("username")}
                  onAnimationStart={handleAutofill("username")}
                  aria-invalid={!!errors.username || undefined}
                />
                {errors.username?.message && (
                  <FieldError>{errorText(errors.username?.message)}</FieldError>
                )}
              </FieldContent>
            </Field>

            {/* Password */}
            <Field
              data-invalid={!!errors.password || undefined}
              className="md:col-span-1"
            >
              <FieldLabel htmlFor="password">
                {t("password")} <span className="text-destructive">*</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  onAnimationStart={handleAutofill("password")}
                  aria-invalid={!!errors.password || undefined}
                />
                {errors.password?.message && (
                  <FieldError>{errorText(errors.password?.message)}</FieldError>
                )}
              </FieldContent>
            </Field>

            {/* Confirm Password */}
            <Field
              data-invalid={!!errors.confirmPassword || undefined}
              className="md:col-span-1"
            >
              <FieldLabel htmlFor="confirmPassword">
                {t("confirmPassword")}{" "}
                <span className="text-destructive">*</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword")}
                  onAnimationStart={handleAutofill("confirmPassword")}
                  aria-invalid={!!errors.confirmPassword || undefined}
                />
                {errors.confirmPassword?.message && (
                  <FieldError>
                    {errorText(errors.confirmPassword?.message)}
                  </FieldError>
                )}
              </FieldContent>
            </Field>
          </div>
        </FieldGroup>
      </CardContent>

      <CardFooter className="justify-end">
        <Button
          onClick={handleSubmit}
          // disabled={!requiredComplete || !isValid || isSubmitting}
          size={'lg'}
          className="min-w-56"
        >
          {isSubmitting && <Spinner data-icon="inline-start" />}
          {t("submit")}
        </Button>
      </CardFooter>
    </Card>
  );
}
