import { defineArrayMember, defineField, defineType } from 'sanity'

export const portfolio = defineType({
  name: 'portfolio',
  title: 'Engineering Portfolio',
  type: 'document',
  fields: [
    defineField({
      name: 'teamNumber',
      title: 'Team Number',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'teamName',
      title: 'Team Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'season',
      title: 'Competition Season',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'schoolOrOrg',
      title: 'School / Organization',
      type: 'string',
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
    }),
    defineField({
      name: 'awards',
      title: 'Awards Won',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'name', title: 'Award Name', type: 'string' }),
            defineField({ name: 'type', title: 'Type', type: 'string' }),
            defineField({ name: 'level', title: 'Level', type: 'string' }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'file',
      title: 'Portfolio PDF File',
      type: 'file',
    }),
    defineField({
      name: 'summary',
      title: 'Executive Summary',
      type: 'object',
      fields: [
        defineField({ name: 'overview', title: 'Overview', type: 'text', rows: 3 }),
        defineField({ name: 'outreach', title: 'Outreach Highlights', type: 'array', of: [{ type: 'string' }] }),
        defineField({ name: 'technical', title: 'Technical Highlights', type: 'array', of: [{ type: 'string' }] }),
        defineField({ name: 'software', title: 'Autonomous Highlights', type: 'array', of: [{ type: 'string' }] }),
      ],
    }),
    defineField({
      name: 'notableMechanisms',
      title: 'Notable Mechanisms',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
    }),
  ],
})
