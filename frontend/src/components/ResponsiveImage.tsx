import React from 'react';
import { cn } from '../lib/utils';

type ResponsiveImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'auto' | 'sync';
  fetchPriority?: 'high' | 'low' | 'auto';
  referrerPolicy?: React.ImgHTMLAttributes<HTMLImageElement>['referrerPolicy'];
  widthSteps?: number[];
};

const DEFAULT_WIDTHS = [320, 480, 640, 960, 1280, 1600];

const isUnsplashUrl = (src: string) => {
  try {
    const url = new URL(src);
    return url.hostname.includes('images.unsplash.com');
  } catch {
    return false;
  }
};

const buildUnsplashUrl = (src: string, width: number, format: 'avif' | 'webp' | 'jpg') => {
  const url = new URL(src);
  url.searchParams.set('w', String(width));
  url.searchParams.set('fm', format);
  if (!url.searchParams.has('fit')) {
    url.searchParams.set('fit', 'crop');
  }
  if (!url.searchParams.has('q')) {
    url.searchParams.set('q', '80');
  }
  if (url.searchParams.has('auto')) {
    url.searchParams.delete('auto');
  }
  return url.toString();
};

const buildSrcSet = (src: string, format: 'avif' | 'webp' | 'jpg', widths: number[]) =>
  widths.map((width) => `${buildUnsplashUrl(src, width, format)} ${width}w`).join(', ');

export default function ResponsiveImage({
  src,
  alt,
  className,
  sizes = '100vw',
  loading = 'lazy',
  decoding = 'async',
  fetchPriority,
  referrerPolicy,
  widthSteps,
}: ResponsiveImageProps) {
  if (!src) {
    return null;
  }

  if (!isUnsplashUrl(src)) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn(className)}
        sizes={sizes}
        loading={loading}
        decoding={decoding}
        fetchPriority={fetchPriority}
        referrerPolicy={referrerPolicy}
      />
    );
  }

  const widths = widthSteps && widthSteps.length > 0 ? widthSteps : DEFAULT_WIDTHS;

  return (
    <picture>
      <source srcSet={buildSrcSet(src, 'avif', widths)} type="image/avif" />
      <source srcSet={buildSrcSet(src, 'webp', widths)} type="image/webp" />
      <img
        src={buildUnsplashUrl(src, widths[Math.min(2, widths.length - 1)], 'jpg')}
        srcSet={buildSrcSet(src, 'jpg', widths)}
        sizes={sizes}
        alt={alt}
        className={cn(className)}
        loading={loading}
        decoding={decoding}
        fetchPriority={fetchPriority}
        referrerPolicy={referrerPolicy}
      />
    </picture>
  );
}
