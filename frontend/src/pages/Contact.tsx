import InfoPageLayout from '../components/InfoPageLayout';

export default function Contact() {
  return (
    <InfoPageLayout
      badge="Contact"
      title="Talk to support, partnerships, or the product team"
      subtitle="Whether you need help with a listing, want to collaborate with UniShare, or have product feedback, this is your entry point."
      highlights={[
        'Fast response for trust-and-safety concerns.',
        'Partnership support for campus organizations.',
        'Feedback channel for feature requests and bugs.',
      ]}
      sections={[
        {
          title: 'Support Requests',
          body: 'For account access, listing disputes, or group subscription issues, contact support with your profile and listing identifiers for faster resolution.',
        },
        {
          title: 'University and Club Partnerships',
          body: 'If you run a campus group or student program, we can help launch verified community buying and sharing spaces tailored to your members.',
        },
        {
          title: 'Product Feedback',
          body: 'Share your ideas for checkout, chat, profile tools, and discovery. Product suggestions from active users directly influence our roadmap.',
        },
      ]}
      ctaLabel="Back to Profile"
      ctaTo="/profile"
    />
  );
}
