import { defineField, defineType } from 'sanity'

// Ghi bởi /api/analytics/track và /api/admin/resources (khi xóa). Không nên sửa tay trong Studio.
export const analyticsEvent = defineType({
  name: 'analyticsEvent',
  title: 'Analytics Event',
  type: 'document',
  fields: [
    defineField({
      name: 'type',
      title: 'Loại',
      type: 'string',
      options: { list: ['view', 'download'] },
      readOnly: true,
    }),
    defineField({
      name: 'resourceId',
      title: 'Resource',
      type: 'reference',
      to: [{ type: 'resource' }],
      readOnly: true,
    }),
    defineField({ name: 'timestamp', title: 'Thời điểm', type: 'datetime', readOnly: true }),
  ],
})
