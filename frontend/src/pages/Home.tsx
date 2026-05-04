import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Search, MapPin, ArrowRight, Book, Users, Sparkles, ShieldCheck, Handshake, BadgeCheck, GraduationCap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const IMAGES = [
  {
    base: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&fit=crop',
    alt: 'Students studying',
  },
  {
    base: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&fit=crop',
    alt: 'Library shelves',
  },
  {
    base: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&fit=crop',
    alt: 'Group collaboration',
  },
];

const IMAGE_WIDTHS = [960, 1440, 2071];

const buildImageUrl = (base: string, width: number, format: 'avif' | 'webp' | 'jpg') =>
  `${base}&w=${width}&fm=${format}`;

const buildSrcSet = (base: string, format: 'avif' | 'webp' | 'jpg') =>
  IMAGE_WIDTHS.map((width) => `${buildImageUrl(base, width, format)} ${width}w`).join(', ');

const HERO_HIGHLIGHTS = [
  { icon: GraduationCap, label: 'Course-specific exchange' },
  { icon: ShieldCheck, label: 'UIU-only verification' },
  { icon: MapPin, label: 'On-campus pickup spots' },
];

const POPULAR_SEARCHES = ['CSE 111', 'EEE 101', 'BBA 201'];

const TRUST_POINTS = [
  {
    icon: ShieldCheck,
    title: 'UIU student verification',
    body: 'Every signup submits a UIU ID card and UIU email for admin review before approval.',
  },
  {
    icon: BadgeCheck,
    title: 'Transparent listings',
    body: 'Clear pricing, course codes, and peer feedback keep exchanges quick and fair.',
  },
  {
    icon: Handshake,
    title: 'Campus-safe handoffs',
    body: 'Coordinate trusted meetups at UIU pickup spots with in-app messaging.',
  },
];

export default function Home() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  const fadeDistance = prefersReducedMotion ? 0 : 18;
  const heroContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.12,
      },
    },
  };
  const heroItemVariants = {
    hidden: { opacity: 0, y: fadeDistance },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.6,
        ease: 'easeOut',
      },
    },
  };
  const revealVariants = {
    hidden: { opacity: 0, y: fadeDistance },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.5,
        ease: 'easeOut',
      },
    },
  };

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % IMAGES.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [prefersReducedMotion]);

  useEffect(() => {
    const nextImage = new Image();
    const nextIndex = (currentImageIndex + 1) % IMAGES.length;
    nextImage.src = buildImageUrl(IMAGES[nextIndex].base, 1440, 'jpg');
  }, [currentImageIndex]);

  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* Hero Section */}
      <section className="relative min-h-[88vh] w-full flex items-center justify-center overflow-hidden rounded-3xl mt-2 mx-auto max-w-[98%]">
        <AnimatePresence mode="wait">
          <motion.picture
            key={currentImageIndex}
            initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 1.08 }}
            animate={{ opacity: 1, scale: prefersReducedMotion ? 1 : 1.02 }}
            exit={{ opacity: 0, scale: prefersReducedMotion ? 1 : 1.04 }}
            transition={{ duration: prefersReducedMotion ? 0 : 1.8, ease: 'easeInOut' }}
            className="absolute inset-0 w-full h-full"
          >
            <source srcSet={buildSrcSet(IMAGES[currentImageIndex].base, 'avif')} type="image/avif" />
            <source srcSet={buildSrcSet(IMAGES[currentImageIndex].base, 'webp')} type="image/webp" />
            <img
              src={buildImageUrl(IMAGES[currentImageIndex].base, 1440, 'jpg')}
              srcSet={buildSrcSet(IMAGES[currentImageIndex].base, 'jpg')}
              sizes="100vw"
              alt={IMAGES[currentImageIndex].alt}
              className="w-full h-full object-cover"
              loading="eager"
              decoding="async"
              fetchPriority="high"
              referrerPolicy="no-referrer"
            />
          </motion.picture>
        </AnimatePresence>
        <div className="absolute inset-0 hero-veil" />
        <div className="absolute inset-0 hero-vignette" />
        <div className="absolute inset-0 hero-noise" aria-hidden="true" />

        <div className="relative z-10 w-full max-w-6xl px-6 lg:px-10">
          <motion.div
            className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]"
            variants={heroContainerVariants}
            initial="hidden"
            animate="show"
          >
            <motion.div
              className="flex flex-col items-center lg:items-start text-center lg:text-left"
              variants={heroContainerVariants}
            >
              <motion.div
                variants={heroItemVariants}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs uppercase tracking-[0.24em] font-medium mb-6 font-body"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>UIU Student Network</span>
              </motion.div>

              <motion.h1
                variants={heroItemVariants}
                className="font-display text-5xl md:text-6xl lg:text-7xl text-white tracking-tight leading-[1.05] mb-6"
              >
                Swap smarter at UIU. <span className="text-white/80">Verified on campus.</span>
              </motion.h1>

              <motion.p
                variants={heroItemVariants}
                className="text-lg md:text-xl text-white/85 mb-8 max-w-xl font-body"
              >
                Buy, sell, and share textbooks, notes, and lab gear with UIU students. Keep your trimester light with verified listings and trusted groups.
              </motion.p>

              <motion.div
                variants={heroItemVariants}
                className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto"
              >
                <Link
                  to="/marketplace"
                  className="w-full sm:w-auto bg-white text-gray-900 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                >
                  Explore Marketplace <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/how-it-works"
                  className="w-full sm:w-auto px-6 py-3 rounded-full font-semibold text-white border border-white/30 hover:border-white/60 hover:bg-white/10 transition-colors"
                >
                  How it works
                </Link>
              </motion.div>

              <motion.div
                variants={heroItemVariants}
                className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-white/75 text-sm font-body"
              >
                {HERO_HIGHLIGHTS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-white/80" />
                      </span>
                      <span className="font-medium">{item.label}</span>
                    </div>
                  );
                })}
              </motion.div>
            </motion.div>

            <motion.div
              variants={heroItemVariants}
              whileHover={prefersReducedMotion ? undefined : { y: -4 }}
              className="w-full rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl p-4 md:p-5 shadow-[0_35px_90px_rgba(15,23,42,0.45)]"
            >
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/60 font-body">
                <span>Search</span>
                <span className="normal-case text-white/60 tracking-normal">Find UIU listings fast</span>
              </div>

              <motion.form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const query = formData.get('q');
                  if (query) {
                    navigate(`/marketplace?q=${encodeURIComponent(query.toString())}`);
                  } else {
                    navigate('/marketplace');
                  }
                }}
                variants={heroItemVariants}
                className="mt-4 space-y-3"
              >
                <div className="flex items-center bg-white/10 rounded-2xl px-4 py-3.5 transition-colors focus-within:bg-white/20 focus-within:ring-1 focus-within:ring-white/30">
                  <Search className="w-5 h-5 text-white/70 mr-3" />
                  <input
                    type="text"
                    name="q"
                    placeholder="Search CSE 111, EEE 101, BBA 201..."
                    aria-label="Search listings"
                    className="bg-transparent border-none outline-none text-white placeholder:text-white/60 w-full text-base"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-white text-gray-900 px-6 py-3.5 rounded-2xl font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                >
                  Search <ArrowRight className="w-4 h-4" />
                </button>
              </motion.form>

              <motion.div
                variants={heroItemVariants}
                className="mt-4 flex flex-wrap items-center gap-2 text-xs text-white/65 font-body"
              >
                <span className="uppercase tracking-[0.2em] text-[10px] text-white/50">Popular</span>
                {POPULAR_SEARCHES.map((item) => (
                  <span key={item} className="rounded-full border border-white/15 bg-white/10 px-3 py-1">
                    {item}
                  </span>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Quick Categories */}
      <section className="max-w-6xl mx-auto px-6 py-24 w-full font-body">
        <motion.div
          className="text-center mb-16"
          variants={revealVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
        >
          <h2 className="text-3xl font-semibold text-gray-900 tracking-tight mb-4 font-display">Explore by Category</h2>
          <p className="text-gray-500">Find exactly what you need for your next trimester.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {[
            { title: 'Textbooks', icon: Book, desc: 'Find UIU-approved course texts and editions.', link: '/marketplace' },
            { title: 'Course Notes', icon: Sparkles, desc: 'Swap lecture notes and study guides by course code.', link: '/marketplace' },
            { title: 'Co-Subscriptions', icon: Users, desc: 'Split study tools with verified UIU peers.', link: '/co-subs' },
          ].map((cat, i) => (
            <motion.div
              key={cat.title}
              variants={revealVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: prefersReducedMotion ? 0 : i * 0.08 }}
              className="h-full"
            >
              <Link to={cat.link} className="group flex flex-col h-full p-8 rounded-2xl bg-white border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow transition-all duration-200">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-8 ring-1 ring-gray-100 group-hover:bg-gray-900 transition-colors duration-300">
                  <cat.icon className="w-5 h-5 text-gray-700 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{cat.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed font-medium">{cat.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
      {/* Why UniShare Section */}
      <section className="relative w-full py-24 overflow-hidden">
        <div
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,#e0f2fe_0,transparent_45%),radial-gradient(circle_at_bottom_left,#fef9c3_0,transparent_55%)]"
          aria-hidden="true"
        />
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.div
              variants={revealVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Built & Trusted at UIU
              </span>
              <h2 className="mt-6 text-3xl md:text-5xl font-semibold text-gray-900 tracking-tight font-display">
                Made for UIU students, trimester by trimester.
              </h2>
              <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                UniShare keeps every exchange student-first with verified-only access, clear course listings, and campus-ready coordination.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm">
                {['UIU-only access', 'Admin-verified profiles', 'Course code tags', 'Campus pickup ready'].map((item) => (
                  <span key={item} className="rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-slate-600 font-medium shadow-sm">
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                icon: GraduationCap,
                title: 'Course-specific exchange',
                body: 'Find listings tagged with UIU course codes so you can prepare for your next trimester faster.',
              },
              {
                icon: ShieldCheck,
                title: 'UIU verification at signup',
                body: 'Every signup submits a UIU ID card and UIU email for admin review before approval.',
              },
              {
                icon: BadgeCheck,
                title: 'Transparent listings',
                body: 'Clear pricing, exact course codes, and peer feedback keep exchanges quick and fair.',
              },
              {
                icon: MapPin,
                title: 'Campus-safe handoffs',
                body: 'Coordinate trusted meetups at the library gate, admin building lobby, or food court.',
              },
            ].map((point, index) => {
              const Icon = point.icon;
              return (
                <motion.article
                  key={point.title}
                  variants={revealVariants}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ delay: prefersReducedMotion ? 0 : index * 0.08 }}
                  className="group rounded-3xl border border-slate-200 bg-white/70 backdrop-blur-md p-8 shadow-sm hover:shadow-md hover:bg-white transition-all"
                >
                  <div className="flex flex-col sm:flex-row items-start gap-6">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-colors duration-300">
                      <Icon className="h-6 w-6 text-slate-700 group-hover:text-white transition-colors" />
                    </span>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">{point.title}</h3>
                      <p className="mt-3 text-base leading-relaxed text-slate-600">{point.body}</p>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}













