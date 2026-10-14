import { defineField, defineType } from 'sanity'

export const analyticsEvent = defineType({
  name: 'analyticsEvent',
  title: 'Analytics Event',
  type: 'document',
  fields: [
    defineField({
      name: 'type',
      title: 'Event Type',
      type: 'string',
      options: {
        list: [
          { title: 'View', value: 'view' },
          { title: 'Download', value: 'download' },
        ],
        layout: 'radio',
      },
      validation: (Rule) =>
        Rule.required().custom((value) => {
          if (value !== 'view' && value !== 'download') {
            return 'Type must be either "view" or "download"'
          }
          return true
        }),
    }),
    defineField({
      name: 'resourceId',
      title: 'Resource',
      type: 'reference',
      to: [{ type: 'resource' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'timestamp',
      title: 'Timestamp',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      resourceTitle: 'resourceId.title',
      type: 'type',
      timestamp: 'timestamp',
    },
    prepare({ resourceTitle, type, timestamp }) {
      const typeLabel = type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Event'
      return {
        title: `${typeLabel}: ${resourceTitle || 'Untitled Resource'}`,
        subtitle: timestamp ? new Date(timestamp).toLocaleString() : 'No timestamp',
      }
    },
  },
})

export default analyticsEvent
