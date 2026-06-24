// Social media icon components for lucide-react compatibility
import React from 'react';

export const Facebook = React.forwardRef<SVGSVGElement, { size?: number; className?: string }>(
  ({ size = 24, className = '' }, ref) =>
    React.createElement('svg', {
      ref,
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      className,
    }, React.createElement('path', { d: 'M18 2h-3a6 6 0 0 0-6 6v4a4 4 0 0 0 4 4h3' }))
);
Facebook.displayName = 'Facebook';

export const Instagram = React.forwardRef<SVGSVGElement, { size?: number; className?: string }>(
  ({ size = 24, className = '' }, ref) =>
    React.createElement('svg', {
      ref,
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      className,
    }, [
      React.createElement('rect', { key: 'rect', x: 2, y: 2, width: 20, height: 20, rx: 5, ry: 5 }),
      React.createElement('path', { key: 'path1', d: 'M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37' }),
      React.createElement('circle', { key: 'circle', cx: 17.5, cy: 6.5, r: 1.5 }),
    ])
);
Instagram.displayName = 'Instagram';

export const Linkedin = React.forwardRef<SVGSVGElement, { size?: number; className?: string }>(
  ({ size = 24, className = '' }, ref) =>
    React.createElement('svg', {
      ref,
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      className,
    }, [
      React.createElement('path', { key: 'path1', d: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6' }),
      React.createElement('rect', { key: 'rect', x: 2, y: 9, width: 4, height: 12 }),
      React.createElement('circle', { key: 'circle', cx: 4, cy: 4, r: 2 }),
    ])
);
Linkedin.displayName = 'Linkedin';

export const Twitter = React.forwardRef<SVGSVGElement, { size?: number; className?: string }>(
  ({ size = 24, className = '' }, ref) =>
    React.createElement('svg', {
      ref,
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      className,
    }, React.createElement('path', { d: 'M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2s9 5 20 5a9.5 9.5 0 0 0-9-5.5c4.75 2.25 7-7 7-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3' }))
);
Twitter.displayName = 'Twitter';
