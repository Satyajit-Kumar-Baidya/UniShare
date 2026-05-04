import InfoPageLayout from '../components/InfoPageLayout';

export default function Terms() {
  return (
    <InfoPageLayout
      badge="Terms"
      title="Rules that keep UniShare fair and trusted"
      subtitle="These terms define account responsibilities, transaction standards, and acceptable behavior across marketplace and subscription-sharing flows."
      highlights={[
        'Users must provide accurate listing and account information.',
        'Fraudulent transactions and abuse are not permitted.',
        'Repeated violations can result in account restrictions.',
      ]}
      sections={[
        {
          title: 'Account Responsibilities',
          body: 'You are responsible for securing your account credentials and for activity performed under your account unless reported as compromised.',
        },
        {
          title: 'Marketplace Conduct',
          body: 'Listings must be legal, accurately represented, and reasonably priced. Manipulated images, deceptive descriptions, or prohibited goods are not allowed.',
        },
        {
          title: 'Shared Subscription Conduct',
          body: 'Group owners and members must respect payment schedules, ownership boundaries, and access policies. Abuse or unauthorized sharing can trigger removal.',
        },
      ]}
      ctaLabel="View Cookie Policy"
      ctaTo="/cookies"
    />
  );
}
