import InfoPageLayout from '../components/InfoPageLayout';

export default function Cookies() {
  return (
    <InfoPageLayout
      badge="Cookies"
      title="Cookie and session transparency"
      subtitle="Cookies and local storage help keep sessions secure and improve usability, and we aim to keep this footprint lean and understandable."
      highlights={[
        'Essential cookies keep login sessions active.',
        'Preference cookies store UI choices and filters.',
        'Analytics cookies remain optional and consent-based.',
      ]}
      sections={[
        {
          title: 'Essential Usage',
          body: 'Core cookies and storage keys support authentication and protect session continuity while navigating marketplace and co-subscription workflows.',
        },
        {
          title: 'Preference Usage',
          body: 'We may save selected filters, sorting preferences, and user interface selections to make repeat visits smoother and faster.',
        },
        {
          title: 'Control Options',
          body: 'You can clear browser storage at any time. A dedicated in-app consent and preferences panel can be added before production rollout.',
        },
      ]}
      ctaLabel="Back to Home"
      ctaTo="/"
    />
  );
}
