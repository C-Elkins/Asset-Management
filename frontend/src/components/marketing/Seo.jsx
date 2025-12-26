import { useEffect } from 'react';

function upsertMeta(attrName, attrValue, content) {
  let el = document.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export const Seo = ({ title, description, image = '/brand/krubles-social-cover-1200.png' }) => {
  useEffect(() => {
    if (title) document.title = title;
    if (description) {
      upsertMeta('name', 'description', description);
    }
    // Open Graph
    if (title) upsertMeta('property', 'og:title', title);
    if (description) upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:site_name', 'Krubles');
    if (image) upsertMeta('property', 'og:image', image);
    // Twitter
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    if (title) upsertMeta('name', 'twitter:title', title);
    if (description) upsertMeta('name', 'twitter:description', description);
    if (image) upsertMeta('name', 'twitter:image', image);
  }, [title, description, image]);
  return null;
};

export default Seo;
