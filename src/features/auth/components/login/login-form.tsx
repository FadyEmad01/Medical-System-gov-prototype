'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { type AnimationEvent, useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/features/auth/hooks/use-auth';
import {
  type LoginFormData,
  loginFormSchema,
} from '@/features/auth/validation/login-form';
import { useRouter } from '@/i18n/navigation';

export function LoginForm() {
  const t = useTranslations('auth');
  const errorText = useCallback(
    (msg?: string) => (msg && t.has(msg) ? t(msg) : (msg ?? '')),
    [t],
  );
  const router = useRouter();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    mode: 'onChange',
    defaultValues: {
      nationalId: '',
      password: '',
    },
  });

  const {
    register,
    formState: { errors },
  } = form;

  // Browsers/password managers can autofill inputs without firing input events,
  // so RHF's internal store never syncs. Sync the DOM value on the autofill
  // animation start so the form state reflects the autofilled values.
  const handleAutofill =
    (name: keyof LoginFormData) =>
    (event: AnimationEvent<HTMLInputElement>) => {
      const value = event.currentTarget.value;
      if (value === '') return;
      form.setValue(name, value, { shouldValidate: true });
    };

  const handleSubmit = useCallback(async () => {
    const valid = await form.trigger();
    if (!valid) return;

    setIsSubmitting(true);
    try {
      const result = await login(form.getValues());

      if (result.success) {
        toast.success(t('loginSuccess'));
        router.push('/');
      } else {
        toast.error(errorText(result.error));
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('errors.loginFailed'));
    } finally {
      setIsSubmitting(false);
    }
  }, [form, login, router, t, errorText]);

  return (
    <div className="flex w-full flex-col gap-6">
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex flex-col gap-6">
          <FieldGroup>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* National ID */}
              <Field
                data-invalid={!!errors.nationalId || undefined}
                className="md:col-span-1"
              >
                <FieldLabel htmlFor="nationalId">
                  {t('nationalId')} <span className="text-destructive">*</span>
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="nationalId"
                    placeholder="XXXXXXXXXXXXXX"
                    {...register('nationalId')}
                    onAnimationStart={handleAutofill('nationalId')}
                    aria-invalid={!!errors.nationalId || undefined}
                  />
                  {errors.nationalId?.message && (
                    <FieldError>
                      {errorText(errors.nationalId?.message)}
                    </FieldError>
                  )}
                </FieldContent>
              </Field>

              {/* Password */}
              <Field
                data-invalid={!!errors.password || undefined}
                className="md:col-span-1"
              >
                <FieldLabel htmlFor="password">
                  {t('password')} <span className="text-destructive">*</span>
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="password"
                    type="password"
                    {...register('password')}
                    onAnimationStart={handleAutofill('password')}
                    aria-invalid={!!errors.password || undefined}
                  />
                  {errors.password?.message && (
                    <FieldError>
                      {errorText(errors.password?.message)}
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
            size={'lg'}
            className="min-w-56"
            disabled={isSubmitting}
          >
            {isSubmitting && <Spinner data-icon="inline-start" />}
            {t('submit')}
          </Button>
        </CardFooter>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        {t('noAccount')}{' '}
        <button
          type="button"
          onClick={() => router.push('/auth/register')}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {t('register')}
        </button>
      </p>
    </div>
  );
}
