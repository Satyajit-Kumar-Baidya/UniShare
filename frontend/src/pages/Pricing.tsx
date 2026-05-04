import InfoPageLayout from '../components/InfoPageLayout';

export default function Pricing() {
  return (
    <InfoPageLayout
      badge="Plans"
      title="Simple pricing for students, clubs, and campus communities"
      subtitle="Start free, then upgrade only when you want additional protections, faster selling tools, and smarter group subscription management."
      highlights={[
        'Free listing and free group creation on the starter tier.',
        'Optional trust and verification add-ons for safer trades.',
        'No surprise commissions hidden in checkout flows.',
      ]}
      sections={[
        {
          title: 'Starter',
          body: 'Best for casual buyers and sellers. Includes listing creation, profile pages, and core group subscription tools with no recurring charge.',
        },
        {
          title: 'Campus Plus',
          body: 'Built for active users who post frequently. Includes boosted visibility slots, smarter listing analytics, and priority moderation support.',
        },
        {
          title: 'Community Teams',
          body: 'Designed for student clubs and shared accounts. Adds member controls, activity reporting, and advanced renewal reminders for group subscriptions.',
        },
      ]}
      ctaLabel="Explore Marketplace"
      ctaTo="/marketplace"
    />
  );
}
