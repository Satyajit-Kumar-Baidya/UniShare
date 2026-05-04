import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { ArrowLeft, ShieldCheck, Users, Key } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { createSubscriptionGroup } from '../lib/api';
import { emitToast } from '../lib/toastBus';
import { newGroupSchema } from '../lib/validation';
import Modal from '../components/Modal';

type GroupFieldErrors = Partial<Record<'service' | 'monthlyCost' | 'totalSpots' | 'duration' | 'description', string>>;

export default function NewGroup() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [listingType, setListingType] = useState<'share' | 'sublet'>('share');
  const [fieldErrors, setFieldErrors] = useState<GroupFieldErrors>({});

  const createGroupMutation = useMutation({
    mutationFn: createSubscriptionGroup,
    onSuccess: async (group) => {
      await queryClient.invalidateQueries({ queryKey: ['subscription-groups'] });
      await queryClient.invalidateQueries({ queryKey: ['subscription-group', group.id] });
      emitToast('Subscription listing created successfully.', 'success');
      navigate(`/co-subs/${group.id}`);
    },
    onError: () => {
      emitToast('Unable to create subscription listing. Please try again.', 'error');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const service = String(formData.get('service') || '').trim();
    const monthlyCost = Number(formData.get('monthlyCost') || 0);
    const totalSpots = Number(formData.get('totalSpots') || 0);
    const duration = Number(formData.get('duration') || 0);
    const description = String(formData.get('description') || '').trim();

    const parsed = newGroupSchema.safeParse({
      service,
      listingType,
      monthlyCost,
      totalSpots: listingType === 'share' ? totalSpots : undefined,
      duration: listingType === 'sublet' ? duration : undefined,
      description,
    });

    if (!parsed.success) {
      const nextErrors: GroupFieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === 'string' && !(key in nextErrors)) {
          nextErrors[key as keyof GroupFieldErrors] = issue.message;
        }
      }
      setFieldErrors(nextErrors);
      emitToast('Please fix the highlighted fields.', 'error');
      return;
    }

    setFieldErrors({});
    createGroupMutation.mutate(parsed.data);
  };

  return (
    <Modal
      isOpen={true}
      onClose={() => navigate(-1)}
      title="List a Subscription"
      description="Share or sublet your digital subscriptions securely."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Listing Type Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Listing Type</label>
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'share', label: 'Share (Group)', icon: Users, desc: 'Split the cost' },
              { id: 'sublet', label: 'Sublet', icon: Key, desc: 'Rent out your plan' }
            ].map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setListingType(type.id as 'share' | 'sublet')}
                className={cn(
                  "flex flex-col items-center justify-center gap-1.5 py-3 px-4 rounded-xl border transition-all duration-200",
                  listingType === type.id 
                    ? "border-indigo-600 bg-indigo-50 text-indigo-700" 
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                <type.icon className="w-5 h-5 mb-1" />
                <span className="text-sm font-medium">{type.label}</span>
                <span className="text-xs opacity-70">{type.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Service Name</label>
          <input name="service" type="text" required placeholder="e.g. Spotify Family, Netflix Premium" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-colors" />
          {fieldErrors.service && <p className="mt-1 text-sm text-red-500">{fieldErrors.service}</p>}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {listingType === 'share' ? 'Total Monthly Cost ($)' : 'Monthly Sublet Price ($)'}
            </label>
            <input name="monthlyCost" type="number" required min="0" step="0.01" placeholder="0.00" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-colors" />
            {fieldErrors.monthlyCost && <p className="mt-1 text-sm text-red-500">{fieldErrors.monthlyCost}</p>}
          </div>
          {listingType === 'share' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Total Spots</label>
              <input name="totalSpots" type="number" required min="2" max="10" placeholder="e.g. 4" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-colors" />
              {fieldErrors.totalSpots && <p className="mt-1 text-sm text-red-500">{fieldErrors.totalSpots}</p>}
            </motion.div>
          )}
          {listingType === 'sublet' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration (Months)</label>
              <input name="duration" type="number" required min="1" max="12" placeholder="e.g. 3" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-colors" />
              {fieldErrors.duration && <p className="mt-1 text-sm text-red-500">{fieldErrors.duration}</p>}
            </motion.div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Description & Rules</label>
          <textarea name="description" required rows={4} placeholder={listingType === 'share' ? "Explain how the account will be shared, rules for profiles, etc." : "Explain what is included, any restrictions, etc."} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none transition-colors"></textarea>
          {fieldErrors.description && <p className="mt-1 text-sm text-red-500">{fieldErrors.description}</p>}
        </div>

        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex gap-3 items-start">
          <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <p className="text-sm text-indigo-800">
            <strong>Escrow Protection:</strong> Funds will be collected from members and held securely. You will receive the payout once {listingType === 'share' ? 'the group is full' : 'the sublet begins'} and you provide the access credentials.
          </p>
        </div>

        <div className="pt-4 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createGroupMutation.isPending}
            className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {createGroupMutation.isPending
              ? 'Creating...'
              : listingType === 'share'
                ? 'Create Group'
                : 'List Sublet'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
