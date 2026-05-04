import InfoPageLayout from '../components/InfoPageLayout';

export default function Blog() {
  return (
    <InfoPageLayout
      badge="Blog"
      title="Insights, product updates, and smarter campus sharing tips"
      subtitle="From practical listing playbooks to launch notes, our blog is where we share what we are building and what we are learning with students."
      highlights={[
        'Weekly practical guides for buyers and sellers.',
        'Release notes for marketplace and group subscription features.',
        'Student stories from real campus communities.',
      ]}
      sections={[
        {
          title: 'Marketplace Playbooks',
          body: 'Learn how to write listing titles that convert, set fair prices, and close transactions faster while maintaining trust and quality standards.',
        },
        {
          title: 'Co-Subscription Tactics',
          body: 'Discover ways to manage group plans cleanly, avoid payment confusion, and maintain healthy member communication across monthly cycles.',
        },
        {
          title: 'Behind The Build',
          body: 'Follow design and engineering updates, including experiments, failures, and wins as we evolve UniShare into a stronger student platform.',
        },
      ]}
      ctaLabel="See How It Works"
      ctaTo="/how-it-works"
    />
  );
}
