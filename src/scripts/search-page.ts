/* ==========================================================================
   站内搜索页（search-page.ts）— page-structure §0.3
   构建期索引经 /<lang>/search/index.json 静态 JSON 输出（search-index.ts）；
   本脚本按 URL query 过滤索引并在客户端渲染结果。文案模板全部来自字典
   （root data-* 属性注入），禁止硬编码。无结果/无 query 时回退到空态面板。
   ========================================================================== */

interface SearchEntry {
  url: string;
  title: string;
  desc?: string;
  sectionLabel: string;
}

function normalize(value: string): string {
  return value.toLocaleLowerCase();
}

/** 打分：标题命中权重最高，其次描述/分组标签 */
function scoreEntry(entry: SearchEntry, q: string): number {
  const nq = normalize(q);
  let score = 0;
  if (normalize(entry.title).includes(nq)) score += 3;
  if (normalize(entry.desc ?? '').includes(nq)) score += 2;
  if (normalize(entry.sectionLabel).includes(nq)) score += 1;
  return score;
}

export function initSearchPage(): void {
  const root = document.querySelector<HTMLElement>('[data-search-page]');
  if (!root) return;

  const query = new URLSearchParams(window.location.search).get('q')?.trim() ?? '';
  if (!query) return; // 无 query：保持默认空态提示

  const lang = root.dataset.lang ?? 'zh';
  const countTemplate = root.dataset.countTemplate ?? '';
  const emptyBodyTemplate = root.dataset.emptyBody ?? '';

  const emptyState = root.querySelector<HTMLElement>('[data-search-empty]');
  const countEl = root.querySelector<HTMLElement>('[data-search-count]');
  const resultsEl = root.querySelector<HTMLElement>('[data-search-results]');
  const hintEl = root.querySelector<HTMLElement>('[data-search-hint]');

  if (hintEl) hintEl.remove();
  if (!resultsEl || !countEl) return;

  fetch(`/${lang}/search/index.json`)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json() as Promise<SearchEntry[]>;
    })
    .then((entries) => {
      const matches = entries
        .map((e) => ({ entry: e, score: scoreEntry(e, query) }))
        .filter((m) => m.score > 0)
        .sort((a, b) => b.score - a.score || normalize(a.entry.title).localeCompare(normalize(b.entry.title)));

      if (matches.length === 0) {
        // 无结果：空态面板 + 带 query 的提示文案
        const body = emptyState?.querySelector<HTMLElement>('[data-empty-body-el]');
        if (body && emptyBodyTemplate) {
          body.textContent = emptyBodyTemplate.replace('{query}', query);
        }
        if (emptyState) emptyState.hidden = false;
        countEl.hidden = true;
        return;
      }

      if (emptyState) emptyState.hidden = true;
      countEl.hidden = false;
      countEl.textContent = countTemplate
        .replace('{count}', String(matches.length))
        .replace('{query}', query);

      const list = resultsEl;
      list.textContent = '';
      for (const { entry } of matches) {
        const item = document.createElement('article');
        item.className = 'search-result';

        const link = document.createElement('a');
        link.href = entry.url;
        link.className = 'search-result__link';

        const title = document.createElement('h4');
        title.className = 'search-result__title';
        title.textContent = entry.title;

        const section = document.createElement('span');
        section.className = 'search-result__section';
        section.textContent = entry.sectionLabel;

        link.append(section, title);

        if (entry.desc) {
          const desc = document.createElement('p');
          desc.className = 'search-result__desc';
          desc.textContent = entry.desc;
          link.append(desc);
        }

        item.append(link);
        list.append(item);
      }
      resultsEl.hidden = false;
    })
    .catch(() => {
      // 索引加载失败：保留空态面板并显示 no-js 提示（fetch 失败时兜底文案）
      if (emptyState) emptyState.hidden = false;
      countEl.hidden = true;
    });
}
