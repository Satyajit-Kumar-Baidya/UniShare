import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { Upload, ArrowLeft, BookOpen, PenTool, Monitor, Info } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { createMarketplaceListing } from '../lib/api';
import { emitToast } from '../lib/toastBus';
import { newListingSchema } from '../lib/validation';
import Modal from '../components/Modal';

type ListingFieldErrors = Partial<
  Record<'title' | 'condition' | 'description' | 'price' | 'exchangeFor', string>
>;

export default function NewListing() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [listingType, setListingType] = useState<'sell' | 'share' | 'barter'>('sell');
  const [category, setCategory] = useState('Books');
  const [fieldErrors, setFieldErrors] = useState<ListingFieldErrors>({});

  const createListingMutation = useMutation({
    mutationFn: createMarketplaceListing,
    onSuccess: async (item) => {
      await queryClient.invalidateQueries({ queryKey: ['marketplace-items'] });
      await queryClient.invalidateQueries({ queryKey: ['seller-profile', 'u-current'] });
      emitToast('Listing published successfully.', 'success');
      navigate(`/marketplace/${item.id}`);
    },
    onError: () => {
      emitToast('Unable to publish listing. Please try again.', 'error');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const title = String(formData.get('title') || '').trim();
    const condition = String(formData.get('condition') || '').trim();
    const description = String(formData.get('description') || '').trim();
    const priceRaw = String(formData.get('price') || '0');
    const exchangeFor = String(formData.get('exchangeFor') || '').trim();

    const parsed = newListingSchema.safeParse({
      title,
      category,
      listingType,
      condition,
      description,
      price: Number(priceRaw),
      exchangeFor,
    });

    if (!parsed.success) {
      const nextErrors: ListingFieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === 'string' && !(key in nextErrors)) {
          nextErrors[key as keyof ListingFieldErrors] = issue.message;
        }
      }
      setFieldErrors(nextErrors);
      emitToast('Please fix the highlighted fields.', 'error');
      return;
    }

    setFieldErrors({});
    createListingMutation.mutate(parsed.data);
  };

  return (
    <Modal 
      isOpen={true} 
      onClose={() => navigate(-1)}
      title="List an Item"
      description="Share, sell, or barter your stationary, books, and electronics."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Listing Type Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Listing Type</label>
          <div className="grid grid-cols-3 gap-4">
            {(['sell', 'share', 'barter'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setListingType(type)}
                className={cn(
                  "py-2.5 px-4 rounded-xl border border-gray-200 text-sm font-medium transition-all duration-200 capitalize",
                  listingType === type 
                    ? "border-gray-900 bg-gray-900 text-white" 
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Category Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { id: 'Books', icon: BookOpen },
              { id: 'Stationary', icon: PenTool },
              { id: 'Electronics', icon: Monitor },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={cn(
                  "flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all duration-200",
                  category === cat.id
                    ? "border-gray-900 bg-gray-50 text-gray-900"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                )}
              >
                <cat.icon className="w-4 h-4" />
                {cat.id}
              </button>
            ))}
          </div>
        </div>

        {/* Image Upload Area */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Product Image <span className="text-gray-400 font-normal">(Optional)</span></label>
          <div className="w-full flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-50 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-colors group cursor-pointer">
            <div className="space-y-2 text-center">
              <Upload className="mx-auto h-8 w-8 text-gray-400 group-hover:text-indigo-500 transition-colors" />
              <div className="flex text-sm text-gray-600 justify-center">
                <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                  <span>Upload a file</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
          <input name="title" type="text" required placeholder="e.g. Introduction to Algorithms, 3rd Edition" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-gray-900 transition-all font-medium" />
          {fieldErrors.title && <p className="mt-1 text-xs text-red-600">{fieldErrors.title}</p>}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {listingType === 'sell' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
              <input name="price" type="number" required min="0" step="0.01" placeholder="0.00" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-gray-900 transition-all font-medium" />
              {fieldErrors.price && <p className="mt-1 text-xs text-red-600">{fieldErrors.price}</p>}
            </motion.div>
          )}
          {listingType === 'barter' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">What are you looking for in exchange?</label>
              <input name="exchangeFor" type="text" required placeholder="e.g. A good condition calculus textbook" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-gray-900 transition-all font-medium" />
              {fieldErrors.exchangeFor && <p className="mt-1 text-xs text-red-600">{fieldErrors.exchangeFor}</p>}
            </motion.div>
          )}
          <div className={cn(listingType !== 'sell' && listingType !== 'barter' ? "sm:col-span-2" : "")}>
            <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
            <select name="condition" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-gray-900 transition-all appearance-none font-medium bg-white">
              <option value="New">New</option>
              <option value="Like New">Like New</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
            {fieldErrors.condition && <p className="mt-1 text-xs text-red-600">{fieldErrors.condition}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea name="description" required rows={4} placeholder="Describe the item's condition, edition, any highlights or markings..." className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none resize-none text-gray-900 transition-all font-medium"></textarea>
          {fieldErrors.description && <p className="mt-1 text-xs text-red-600">{fieldErrors.description}</p>}
        </div>

        {listingType === 'share' && (
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex gap-3 items-start">
            <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-800">
              <strong>Sharing is caring!</strong> You are listing this item for free. Other users will be able to request it from you.
            </p>
          </div>
        )}

        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={createListingMutation.isPending}
            className="flex-1 py-3.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-60 text-white rounded-xl font-medium transition-all duration-200"
          >
            {createListingMutation.isPending ? 'Publishing...' : 'Publish Listing'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 bg-white text-gray-700 border border-gray-200 py-3.5 px-6 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
