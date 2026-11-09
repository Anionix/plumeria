import { defineDocs, defineConfig } from 'fumadocs-mdx/config';
import { pageSchema } from 'fumadocs-core/source/schema';
import lastModified from 'fumadocs-mdx/plugins/last-modified';
import { z } from 'zod';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

type HastNode = { type: string; tagName?: string; properties?: Record<string, unknown>; children?: HastNode[] };

// Browser translation rewrites code, class names and file names. Mark code
// blocks (<pre>) and inline code (<code> in prose) as not to be translated.
// `translate` is inherited, so marking <pre> also covers the title of the
// block, which the code block component renders around it.
const noTranslate = new Set(['pre', 'code']);

const rehypeNoTranslateCode = () => (tree: HastNode) => {
  const visit = (node: HastNode) => {
    if (node.type === 'element' && noTranslate.has(node.tagName ?? '')) {
      node.properties = { ...node.properties, translate: 'no' };
    }
    node.children?.forEach(visit);
  };
  visit(tree);
};

export const { docs, meta } = defineDocs({
  dir: 'content/docs',
  docs: {
    async: true,
    schema: pageSchema.extend({
      stability: z.enum(['Frozen', 'Stable', 'Candidate']).optional(),
    }),
    postprocess: { includeProcessedMarkdown: true },
  },
});

export const { docs: blogDocs, meta: blogMeta } = defineDocs({
  dir: 'content/blog',
  docs: {
    async: true,
    schema: pageSchema.extend({
      date: z.string(),
    }),
  },
});

export default defineConfig({
  plugins: [lastModified()],
  mdxOptions: {
    remarkPlugins: [remarkMath],
    rehypePlugins: (v) => [rehypeKatex, ...v, rehypeNoTranslateCode],
    rehypeCodeOptions: {
      inline: 'tailing-curly-colon',
      themes: {
        light: 'laserwave',
        dark: 'laserwave',
      },
    },
  },
});
