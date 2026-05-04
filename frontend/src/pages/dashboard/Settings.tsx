import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { BadgeCheck, Check, Clock, ShieldAlert } from "lucide-react";
<<<<<<< HEAD
import { useAuth, type User } from "../../context/AuthContext";
=======
import { useAuth } from "../../context/AuthContext";
>>>>>>> 0be0122be41c58c2752f616568afa17768dae0af
import { getMockUserByEmail, updateUserProfile } from "../../lib/api";

export default function Settings() {
  const { user, updateUser } = useAuth();
  
  const [editName, setEditName] = useState(user?.name || "");
  const [editPhone, setEditPhone] = useState(user?.phone || "");
  const [editAddress, setEditAddress] = useState(user?.address || "");
  const [editUniversity, setEditUniversity] = useState(user?.university || "");
  const [editMajor, setEditMajor] = useState(user?.major || "");
  const [editGraduationYear, setEditGraduationYear] = useState(user?.graduationYear || "");
  const [editBio, setEditBio] = useState(user?.bio || "");
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const syncUser = async () => {
      if (!user?.email) {
        return;
      }
      const latest = await getMockUserByEmail(user.email);
      if (latest && isActive) {
<<<<<<< HEAD
        updateUser(latest as Partial<User>);
=======
        updateUser(latest);
>>>>>>> 0be0122be41c58c2752f616568afa17768dae0af
      }
    };

    void syncUser();
    return () => {
      isActive = false;
    };
  }, [user?.email]);

  const formatDate = (value?: string, fallback = "Not submitted") =>
    value
      ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : fallback;

  const verificationStatus = user?.verificationStatus ?? (user?.isVerified ? "verified" : "unverified");
  const statusConfig = {
    verified: {
      label: "Verified",
      message: "Your UIU account is approved for marketplace access.",
      icon: BadgeCheck,
      styles: "border-emerald-200 bg-emerald-50 text-emerald-700",
    },
    pending: {
      label: "Pending review",
      message: "Admin review in progress. We will notify you when approved.",
      icon: Clock,
      styles: "border-amber-200 bg-amber-50 text-amber-700",
    },
    rejected: {
      label: "Rejected",
      message: "Your submission needs attention. Review the admin note below.",
      icon: ShieldAlert,
      styles: "border-rose-200 bg-rose-50 text-rose-700",
    },
    unverified: {
      label: "Not submitted",
      message: "Submit your UIU verification at signup to unlock marketplace access.",
      icon: ShieldAlert,
      styles: "border-orange-200 bg-orange-50 text-orange-700",
    },
  } as const;
  const verification = statusConfig[verificationStatus];
  const VerificationIcon = verification.icon;

  const handleSaveProfile = async () => {
    if (!user) {
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    try {
      const updated = await updateUserProfile(user.id, {
        name: editName,
        phone: editPhone,
        address: editAddress,
        university: editUniversity,
        major: editMajor,
        graduationYear: editGraduationYear,
        bio: editBio,
      });
<<<<<<< HEAD
      updateUser(updated as Partial<User>);
=======
      updateUser(updated);
>>>>>>> 0be0122be41c58c2752f616568afa17768dae0af
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err: any) {
      setSaveError(err?.message ?? "Unable to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">Profile Settings</h3>
      
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Basic Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input type="email" value={user?.email || ""} disabled className="w-full px-4 py-2 border border-gray-200 bg-gray-100 text-gray-500 rounded-xl outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="+1 (555) 000-0000" className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
            <input type="text" value={editAddress} onChange={(e) => setEditAddress(e.target.value)} placeholder="123 Campus Dr, City, State, Zip" className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all" />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Academic & Bio</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">University / College</label>
            <input type="text" value={editUniversity} onChange={(e) => setEditUniversity(e.target.value)} placeholder="e.g. Stanford University" className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Major</label>
              <input type="text" value={editMajor} onChange={(e) => setEditMajor(e.target.value)} placeholder="e.g. Computer Science" className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grad Year</label>
              <input type="text" value={editGraduationYear} onChange={(e) => setEditGraduationYear(e.target.value)} placeholder="e.g. 2026" className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all" />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio / About Me</label>
          <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} rows={3} placeholder="Tell others a bit about yourself..." className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all resize-none" />
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className={`mt-1 inline-flex h-10 w-10 items-center justify-center rounded-xl border ${verification.styles}`}>
              <VerificationIcon className="h-5 w-5" />
            </span>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Verification Status</h4>
              <p className="text-xs text-gray-600 mt-1">{verification.message}</p>
            </div>
          </div>
          <span className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold border ${verification.styles}`}>
            {verification.label}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">UIU Email</p>
            <p className="text-gray-900 mt-1">{user?.uiuEmail || "Not provided"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">UIU ID Number</p>
            <p className="text-gray-900 mt-1">{user?.uiuIdNumber || "Not provided"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">ID Card</p>
            <p className="text-gray-900 mt-1">{user?.uiuIdImage ? "Uploaded" : "Not provided"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Submitted</p>
            <p className="text-gray-900 mt-1">{formatDate(user?.verificationSubmittedAt, "Not submitted")}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Reviewed</p>
            <p className="text-gray-900 mt-1">{formatDate(user?.verificationReviewedAt, "Not reviewed")}</p>
          </div>
        </div>

        {verificationStatus === "rejected" && user?.verificationNote ? (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            Admin note: <span className="font-semibold text-rose-900">{user.verificationNote}</span>
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleSaveProfile}
          disabled={isSaving}
          className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
        {isSaved && (
          <span className="text-sm font-medium text-emerald-600 flex items-center gap-1.5">
            <Check className="w-4 h-4" />
            Saved successfully!
          </span>
        )}
        {saveError && <span className="text-sm font-medium text-rose-600">{saveError}</span>}
      </div>
    </motion.div>
  );
}
