// 中文站搜索索引（构建期生成静态 JSON）：/zh/search/index.json
import type { APIRoute } from 'astro';
import { buildSearchIndex } from '../../../utils/search-index';

export const GET: APIRoute = () => {
  const entries = buildSearchIndex('zh');
  return new Response(JSON.stringify(entries), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
