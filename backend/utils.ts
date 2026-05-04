/**
 * Shared formatters — convert SQLite row shapes to the API response shapes
 * the frontend expects (camelCase, computed fields, no password_hash).
 */

export function formatUser(row: any) {
  if (!row) return null;
  const { password_hash: _ph, ..._ } = row;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role ?? "user",
    avatar: row.avatar ?? undefined,
    phone: row.phone ?? undefined,
    address: row.address ?? undefined,
    bio: row.bio ?? undefined,
    university: row.university ?? undefined,
    major: row.major ?? undefined,
    graduationYear: row.graduation_year ?? undefined,
    uiuEmail: row.uiu_email ?? undefined,
    uiuIdNumber: row.uiu_id_number ?? undefined,
    uiuIdImage: row.uiu_id_image ?? undefined,
    verificationStatus: row.verification_status ?? "unverified",
    verificationNote: row.verification_note ?? undefined,
    verificationSubmittedAt: row.verification_submitted_at ?? undefined,
    verificationReviewedAt: row.verification_reviewed_at ?? undefined,
    isVerified: row.verification_status === "verified",
    joinedDate: row.joined_date ?? undefined,
  };
}

export function formatItem(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    price: row.price ?? 0,
    exchangeFor: row.exchange_for ?? undefined,
    condition: row.condition ?? undefined,
    category: row.category ?? undefined,
    description: row.description ?? undefined,
    image: row.image_url ?? undefined,
    seller: row.seller_name ?? "Unknown",
    sellerId: row.seller_id,
    sellerRating: row.seller_rating
      ? Number(Number(row.seller_rating).toFixed(1))
      : 0,
    reviewsCount: Number(row.reviews_count ?? 0),
    sellerLastActive: "Active recently",
  };
}

export function formatGroup(row: any) {
  if (!row) return null;
  const filledSpots = Number(row.filled_spots ?? 0);
  const totalSpots = Number(row.total_spots ?? 1);
  const totalPrice = Number(row.total_price ?? 0);
  return {
    id: row.id,
    service: row.service,
    type: row.type,
    totalPrice,
    pricePerMonth:
      row.type === "share"
        ? Number((totalPrice / Math.max(totalSpots, 1)).toFixed(2))
        : totalPrice,
    totalSpots,
    filledSpots,
    owner: row.owner_name ?? "Unknown",
    icon: row.icon ?? "Users",
    description: row.description ?? undefined,
    duration: row.duration_months ?? undefined,
  };
}

export function formatVerificationRequest(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    name: row.user_name ?? undefined,
    email: row.user_email ?? undefined,
    uiuEmail: row.uiu_email ?? undefined,
    uiuIdNumber: row.uiu_id_number ?? undefined,
    uiuIdImage: row.uiu_id_image ?? undefined,
    status: row.status,
    adminNote: row.admin_note ?? undefined,
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at ?? undefined,
  };
}
