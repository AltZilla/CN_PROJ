const { z } = require('zod');

const IssueCreateSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(5).max(1000),
  category: z.string().min(2).max(50),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  photo: z.string().optional(), // Can be base64 data or URL
  userId: z.string().optional()
});

module.exports = { IssueCreateSchema };
