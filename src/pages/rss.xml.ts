import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { site } from '../data/site';
import { getPosts } from '../lib/posts';
import { postHref } from '../lib/entries';
import { feedHtml } from '../lib/feed';

/** Full-content RSS: every published post, newest first. Drafts never appear (getPosts). */
export const GET: APIRoute = async (context) => {
  if (!context.site) throw new Error('Set `site` in astro.config.mjs; the feed needs absolute links.');
  const origin = context.site;
  const posts = await getPosts();
  return rss({
    title: site.name,
    description: site.tagline,
    site: origin,
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
    // `atom:link rel="self"` is what feed validators recommend for RSS 2.0.
    customData: `<language>en</language><atom:link href="${new URL(site.rss, origin).href}" rel="self" type="application/rss+xml"/>`,
    items: posts.map((post) => {
      const html = post.rendered?.html;
      if (!html) throw new Error(`Post ${post.id} has no rendered HTML for the feed.`);
      return {
        title: post.data.title,
        link: postHref(post.id),
        pubDate: new Date(`${post.data.date}T12:00:00Z`),
        description: post.data.dek,
        content: feedHtml(html, origin),
      };
    }),
  });
};
