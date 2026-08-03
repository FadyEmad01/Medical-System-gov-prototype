import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const [auth, patients, visits, appShell, dashboard, doctor, admin] =
    await Promise.all([
      import(`../features/auth/translations/${locale}.json`).then(
        (m) => m.default,
      ),
      import(`../features/patients/translations/${locale}.json`).then(
        (m) => m.default,
      ),
      import(`../features/visits/translations/${locale}.json`).then(
        (m) => m.default,
      ),
      import(`../features/app-shell/translations/${locale}.json`).then(
        (m) => m.default,
      ),
      import(`../features/dashboard/translations/${locale}.json`).then(
        (m) => m.default,
      ),
      import(`../features/doctor/translations/${locale}.json`).then(
        (m) => m.default,
      ),
      import(`../features/admin/translations/${locale}.json`).then(
        (m) => m.default,
      ),
    ]);

  return {
    locale,
    messages: {
      auth,
      patients,
      visits,
      'app-shell': appShell,
      dashboard,
      doctor,
      admin,
    },
  };
});
