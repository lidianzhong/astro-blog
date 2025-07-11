import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/blog',
  }),
  schema: z.object({
    // title: z.string(),
    // date: z.coerce.date(),
    // updatedAt: z.coerce.date().optional(),
  }),
});

export const collections = {
  blog,
};


// === Custom global config ===

const categoryLabels: Record<string, string> = {
  cpp: 'C++',
  algorithm: 'Algorithm',
  machine_learning: 'Machine Learning',
  misc: 'Miscellaneous',
  // 这里添加其它新的分类
};

const groupLabels: Record<string, string> = {
  temp: '临时组',
  // 这里添加其它新的分组标签
}

export default categoryLabels;
export { groupLabels };
