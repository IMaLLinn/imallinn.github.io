import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const routeSlug = z.string().regex(/^[\p{L}\p{N}][\p{L}\p{N}._-]*$/u);
const webUrl = z.url({ protocol: /^https?$/ });
const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string().trim().min(1),
    pubDate: z.coerce.date(),
    description: z.string().trim().min(1),
    slug: routeSlug.optional(),
    displayTitle: z.string().trim().min(1).optional(),
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    series: z.string().optional(),
    seriesOrder: z.number().optional(),
    featured: z.enum(['vertical', 'horizontal']).optional(),
    featuredOrder: z.number().optional(),
    cover: z.string().optional(),
    accent: z.enum(['emerald', 'violet', 'blue', 'amber', 'rose']).optional(),
    visualStyle: z.enum(['pixel', 'chart', 'terminal', 'grid']).optional(),
    repoUrl: webUrl.optional(),
    demoUrl: webUrl.optional(),
    draft: z.boolean().default(false),
    archived: z.boolean().default(false),
    summary: z.string().optional(),
    author: z.string().optional(),
    comment: z.boolean().optional(),
    aliases: z.array(z.string().regex(/^\/posts\/[\p{L}\p{N}][\p{L}\p{N}._-]*\/?$/u)).default([]),
  }).strict(),
});

export const collections = { posts };
