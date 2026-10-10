// English search index (static JSON at build): /en/search/index.json
import type { APIRoute } from 'astro';
import { buildSearchIndex } from '../../../utils/search-index';

export const GET: APIRoute = () => {
  const entries = buildSearchIndex('en');
  return new Response(JSON.stringify(entries), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
