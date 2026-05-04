import { z } from 'zod';

export const newListingSchema = z.discriminatedUnion('listingType', [
  z.object({
    listingType: z.literal('sell'),
    title: z.string().trim().min(3, 'Title must be at least 3 characters.'),
    category: z.string().trim().min(1, 'Category is required.'),
    condition: z.string().trim().min(1, 'Condition is required.'),
    description: z.string().trim().min(12, 'Description must be at least 12 characters.'),
    price: z.number().positive('Price must be greater than 0.'),
    exchangeFor: z.string().optional(),
  }),
  z.object({
    listingType: z.literal('share'),
    title: z.string().trim().min(3, 'Title must be at least 3 characters.'),
    category: z.string().trim().min(1, 'Category is required.'),
    condition: z.string().trim().min(1, 'Condition is required.'),
    description: z.string().trim().min(12, 'Description must be at least 12 characters.'),
    price: z.number().optional(),
    exchangeFor: z.string().optional(),
  }),
  z.object({
    listingType: z.literal('barter'),
    title: z.string().trim().min(3, 'Title must be at least 3 characters.'),
    category: z.string().trim().min(1, 'Category is required.'),
    condition: z.string().trim().min(1, 'Condition is required.'),
    description: z.string().trim().min(12, 'Description must be at least 12 characters.'),
    exchangeFor: z.string().trim().min(3, 'Please describe your exchange request.'),
    price: z.number().optional(),
  }),
]);

export const newGroupSchema = z.discriminatedUnion('listingType', [
  z.object({
    listingType: z.literal('share'),
    service: z.string().trim().min(2, 'Service name is required.'),
    monthlyCost: z.number().positive('Monthly cost must be greater than 0.'),
    totalSpots: z.number().int().min(2, 'At least 2 spots are required.').max(10, 'Maximum is 10 spots.'),
    duration: z.number().optional(),
    description: z.string().trim().min(12, 'Description must be at least 12 characters.'),
  }),
  z.object({
    listingType: z.literal('sublet'),
    service: z.string().trim().min(2, 'Service name is required.'),
    monthlyCost: z.number().positive('Monthly cost must be greater than 0.'),
    duration: z.number().int().min(1, 'Minimum duration is 1 month.').max(12, 'Maximum duration is 12 months.'),
    totalSpots: z.number().optional(),
    description: z.string().trim().min(12, 'Description must be at least 12 characters.'),
  }),
]);

export type NewListingFormData = z.infer<typeof newListingSchema>;
export type NewGroupFormData = z.infer<typeof newGroupSchema>;
