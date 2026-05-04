import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

type InfoSection = {
  title: string;
  body: string;
};

type InfoPageLayoutProps = {
  badge: string;
  title: string;
  subtitle: string;
  highlights: string[];
  sections: InfoSection[];
  ctaLabel?: string;
  ctaTo?: string;
};

export default function InfoPageLayout({
  badge,
  title,
  subtitle,
  highlights,
  sections,
  ctaLabel = 'Back to Home',
  ctaTo = '/',
}: InfoPageLayoutProps) {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,#fef3c7_0,transparent_40%),radial-gradient(circle_at_bottom_right,#ccfbf1_0,transparent_45%)]" />

      <div className="mx-auto max-w-6xl px-6 py-12 sm:py-16 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32 }}
          className="mb-10"
        >
          <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold tracking-wide text-amber-700">
            {badge}
          </span>

          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">{subtitle}</p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: 0.05 }}
            className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-sm backdrop-blur"
          >
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">At A Glance</h2>
            <ul className="mt-4 space-y-3">
              {highlights.map((highlight) => (
                <li key={highlight} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-teal-500" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>

            <Link
              to={ctaTo}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              {ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <div className="space-y-4 lg:col-span-2">
            {sections.map((section, index) => (
              <motion.article
                key={section.title}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.08 + index * 0.06 }}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <h3 className="text-xl font-semibold text-slate-900">{section.title}</h3>
                <p className="mt-2 leading-relaxed text-slate-600">{section.body}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}