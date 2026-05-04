import InfoPageLayout from '../components/InfoPageLayout';

export default function Privacy() {
  return (
    <InfoPageLayout
      badge="Privacy"
      title="Your data belongs to you"
      subtitle="We keep data collection minimal, explain why each data point is used, and design controls so you can manage your privacy confidently."
      highlights={[
        'Minimal collection for account and transaction safety.',
        'Clear retention windows for logs and activity records.',
        'Export and deletion workflows before production release.',
      ]}
      sections={[
        {
          title: 'What We Collect',
          body: 'Account identity details, listing metadata, message history required for platform operations, and limited diagnostics used to keep the app stable.',
        },
        {
          title: 'How We Use Data',
          body: 'Data is used to power marketplace transactions, group subscription management, fraud prevention, and product reliability improvements.',
        },
        {
          title: 'Your Controls',
          body: 'You will be able to manage profile visibility, adjust notification preferences, and request account data export or account deletion.',
        },
      ]}
      ctaLabel="Read Terms"
      ctaTo="/terms"
    />
  );
}
