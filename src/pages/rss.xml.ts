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
    customData: '<language>en</language>',
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
