import { z, defineCollection } from 'astro:content';

// Blog content collection schema
const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.string().default('Laser Cutting'),
    tags: z.array(z.string()).default([]),
    image: z.string().default('/images/metal.webp'),
    imageAlt: z.string().optional(),
    readTime: z.string().default('5 menit baca'),
    author: z.string().default('Tim Raja Cutting Laser'),
    primaryKeyword: z.string().optional(),
    keyTakeaways: z.array(z.string()).optional(),
    faq: z.array(z.object({
      question: z.string(),
      answer: z.string()
    })).default([]),
    relatedLinks: z.array(z.object({
      title: z.string(),
      href: z.string()
    })).default([]),
    draft: z.boolean().default(false)
  }).transform((data) => ({
    ...data,
    updatedDate: data.updatedDate ?? data.pubDate,
    imageAlt: data.imageAlt ?? data.title,
    primaryKeyword: data.primaryKeyword ?? (data.tags[0] || data.category || 'jasa laser cutting'),
    keyTakeaways: data.keyTakeaways && data.keyTakeaways.length >= 3
      ? data.keyTakeaways.slice(0, 5)
      : [
          data.description,
          'Konsultasi teknis & estimasi biaya gratis bersama tim engineering Raja Cutting Laser.',
          'Pengerjaan presisi tinggi menggunakan mesin Fiber Laser, CO2, & CNC Router modern.'
        ]
  }))
});

export const collections = { blog };
