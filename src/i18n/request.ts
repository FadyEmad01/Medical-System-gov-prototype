import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const [auth, patients, visits, prescriptions, labRequests, radiology] =
    await Promise.all([
      import(`../features/auth/translations/${locale}.json`).then((m) => m.default),
      import(`../features/patients/translations/${locale}.json`).then((m) => m.default),
      import(`../features/visits/translations/${locale}.json`).then((m) => m.default),
      import(`../features/prescriptions/translations/${locale}.json`).then((m) => m.default),
      import(`../features/lab-requests/translations/${locale}.json`).then((m) => m.default),
      import(`../features/radiology/translations/${locale}.json`).then((m) => m.default),
    ]);

  return {
    locale,
    messages: { auth, patients, visits, prescriptions, labRequests, radiology },
  };
});
