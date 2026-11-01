import { defineArrayMember, defineField, defineType } from 'sanity'

export const resource = defineType({
  name: 'resource',
  title: 'Resource',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Tiêu đề', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'category',
      title: 'Chuyên mục',
      type: 'string',
      options: { list: ['CAD', 'Programming', 'Mechanical', 'Failure Log'] },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'author', title: 'Tác giả', type: 'string' }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'description',
      title: 'Mô tả',
      type: 'array',
      of: [defineArrayMember({ type: 'block' })],
    }),
    defineField({ name: 'file', title: 'File đính kèm', type: 'file' }),
    defineField({ name: 'publishedAt', title: 'Ngày đăng', type: 'datetime' }),
  ],
})
