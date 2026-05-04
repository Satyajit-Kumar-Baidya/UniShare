import {
  MARKETPLACE_ITEMS,
  SUBSCRIPTION_GROUPS,
  REVIEWS,
  MOCK_USERS,
  VERIFICATION_REQUESTS,
} from "../data/mock";
import { apiClient } from "./apiClient";

/**
 * FEATURE FLAG: set USE_MOCK to false when connecting to the backend.
 */
const USE_MOCK = false;

export type MarketplaceItem = (typeof MARKETPLACE_ITEMS)[number];
export type SubscriptionGroup = (typeof SUBSCRIPTION_GROUPS)[number];
export type Review = (typeof REVIEWS)[number];
export type MockUser = (typeof MOCK_USERS)[number];
export type VerificationRequest = (typeof VERIFICATION_REQUESTS)[number];

export type SellerProfileData = {
  sellerId: string;
  sellerName: string;
  sellerRating: number;
  reviewsCount: number;
  sellerLastActive?: string;
  items: MarketplaceItem[];
};

export type CreateMarketplaceListingInput = {
  title: string;
  category: string;
  listingType: "sell" | "share" | "barter";
  condition: string;
  description: string;
  price?: number;
  exchangeFor?: string;
};

export type CreateSubscriptionGroupInput = {
  service: string;
  listingType: "share" | "sublet";
  monthlyCost: number;
  totalSpots?: number;
  duration?: number;
  description: string;
};

export type VerificationSubmissionInput = {
  name: string;
  email: string;
  uiuEmail: string;
  uiuIdNumber: string;
  uiuIdImage: string;
};

const wait = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));
const normalizeEmail = (value: string) => value.trim().toLowerCase();

// ── Auth functions (always hit the real backend) ──────────────────────────────

export type LoginInput = { email: string; password: string };
export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  uiuEmail?: string;
  uiuIdNumber?: string;
  uiuIdImage?: string;
};

export async function loginUser(
  input: LoginInput,
): Promise<{ user: MockUser; token: string }> {
  return apiClient<{ user: MockUser; token: string }>("/auth/login", {
    data: input,
  });
}

export async function registerUser(
  input: RegisterInput,
): Promise<{ user: MockUser; token: string }> {
  return apiClient<{ user: MockUser; token: string }>("/auth/register", {
    data: input,
  });
}

export async function getMarketplaceItems(): Promise<MarketplaceItem[]> {
  if (!USE_MOCK) {
    return apiClient<MarketplaceItem[]>("/marketplace/");
  }

  await wait();
  return MARKETPLACE_ITEMS;
}

export async function getMarketplaceItemById(
  id: string,
): Promise<MarketplaceItem | undefined> {
  if (!USE_MOCK) {
    return apiClient<MarketplaceItem>(`/marketplace/${id}/`);
  }

  await wait();
  return MARKETPLACE_ITEMS.find((item) => item.id === id);
}

export async function getMarketplaceItemsBySellerId(
  sellerId: string,
): Promise<MarketplaceItem[]> {
  if (!USE_MOCK) {
    return apiClient<MarketplaceItem[]>(`/marketplace/?seller=${sellerId}`);
  }

  await wait();
  return MARKETPLACE_ITEMS.filter((item) => item.sellerId === sellerId);
}

export async function getSellerProfileById(
  sellerId: string,
): Promise<SellerProfileData | undefined> {
  if (!USE_MOCK) {
    return apiClient<SellerProfileData>(`/seller/${sellerId}`);
  }

  await wait();
  const items = MARKETPLACE_ITEMS.filter((item) => item.sellerId === sellerId);
  const primary = items[0];

  if (!primary) {
    return undefined;
  }

  return {
    sellerId,
    sellerName: primary.seller,
    sellerRating: primary.sellerRating,
    reviewsCount: primary.reviewsCount,
    sellerLastActive: primary.sellerLastActive,
    items,
  };
}

export async function getSubscriptionGroups(): Promise<SubscriptionGroup[]> {
  if (!USE_MOCK) {
    return apiClient<SubscriptionGroup[]>("/co-subs/");
  }

  await wait();
  return SUBSCRIPTION_GROUPS;
}

export async function getSubscriptionGroupById(
  id: string,
): Promise<SubscriptionGroup | undefined> {
  if (!USE_MOCK) {
    return apiClient<SubscriptionGroup>(`/co-subs/${id}/`);
  }

  await wait();
  return SUBSCRIPTION_GROUPS.find((group) => group.id === id);
}

export async function getCartPreviewItems(): Promise<MarketplaceItem[]> {
  if (!USE_MOCK) {
    return apiClient<MarketplaceItem[]>("/cart/");
  }

  await wait();
  return [MARKETPLACE_ITEMS[0], MARKETPLACE_ITEMS[1]];
}

export async function createMarketplaceListing(
  input: CreateMarketplaceListingInput,
): Promise<MarketplaceItem> {
  if (!USE_MOCK) {
    return apiClient<MarketplaceItem>("/marketplace/", { data: input });
  }

  await wait(300);

  const item: MarketplaceItem = {
    id: `${Date.now()}`,
    title: input.title,
    type: input.listingType,
    price: input.listingType === "sell" ? (input.price ?? 0) : 0,
    exchangeFor: input.listingType === "barter" ? input.exchangeFor : undefined,
    condition: input.condition,
    category: input.category,
    seller: "Account Owner",
    sellerId: "u-current",
    sellerRating: 4.9,
    reviewsCount: 0,
    description: input.description,
    image:
      "https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=800&auto=format&fit=crop",
    sellerLastActive: "Active Now",
  };

  MARKETPLACE_ITEMS.unshift(item);
  return item;
}

export async function createSubscriptionGroup(
  input: CreateSubscriptionGroupInput,
): Promise<SubscriptionGroup> {
  if (!USE_MOCK) {
    return apiClient<SubscriptionGroup>("/co-subs/", { data: input });
  }

  await wait(300);

  const group: SubscriptionGroup = {
    id: `${Date.now()}`,
    service: input.service,
    type: input.listingType,
    totalPrice: input.monthlyCost,
    pricePerMonth:
      input.listingType === "share"
        ? Number(
            (input.monthlyCost / Math.max(input.totalSpots ?? 2, 1)).toFixed(2),
          )
        : input.monthlyCost,
    totalSpots: input.listingType === "share" ? (input.totalSpots ?? 2) : 1,
    filledSpots: input.listingType === "share" ? 1 : 0,
    owner: "Account Owner",
    icon: "Users",
    description: input.description,
    duration: input.listingType === "sublet" ? input.duration : undefined,
  };

  SUBSCRIPTION_GROUPS.unshift(group);
  return group;
}

export async function getMockUserByEmail(
  email: string,
): Promise<MockUser | undefined> {
  if (!USE_MOCK) {
    return apiClient<MockUser>(
      `/users/by-email/?email=${encodeURIComponent(email)}`,
    );
  }

  await wait();
  const normalized = normalizeEmail(email);
  return MOCK_USERS.find(
    (user) =>
      normalizeEmail(user.email) === normalized ||
      normalizeEmail(user.uiuEmail ?? "") === normalized,
  );
}

export async function getAllUsers(): Promise<MockUser[]> {
  if (!USE_MOCK) {
    return apiClient<MockUser[]>("/users/");
  }

  await wait();
  return [...MOCK_USERS];
}

export async function submitVerificationRequest(
  input: VerificationSubmissionInput,
): Promise<{
  user: MockUser;
  request: VerificationRequest;
}> {
  if (!USE_MOCK) {
    return apiClient<{ user: MockUser; request: VerificationRequest }>(
      "/verifications/submit/",
      {
        data: input,
      },
    );
  }

  await wait(400);

  const normalizedEmail = normalizeEmail(input.email);
  const existingIndex = MOCK_USERS.findIndex(
    (user) => normalizeEmail(user.email) === normalizedEmail,
  );
  const existingUser =
    existingIndex >= 0 ? MOCK_USERS[existingIndex] : undefined;
  const userId = existingUser ? existingUser.id : `u-${Date.now()}`;
  const submittedAt = new Date().toISOString();

  const nextUser: MockUser = {
    id: userId,
    name: input.name,
    email: input.email,
    role: existingUser?.role ?? "user",
    uiuEmail: input.uiuEmail,
    uiuIdNumber: input.uiuIdNumber,
    uiuIdImage: input.uiuIdImage,
    verificationStatus: "pending",
    verificationSubmittedAt: submittedAt,
    joinedDate:
      existingUser?.joinedDate ??
      new Date().toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
  };

  if (existingIndex >= 0) {
    MOCK_USERS[existingIndex] = {
      ...MOCK_USERS[existingIndex],
      ...nextUser,
      verificationReviewedAt: undefined,
      verificationNote: undefined,
      isVerified: false,
    };
  } else {
    MOCK_USERS.unshift({ ...nextUser, isVerified: false });
  }

  const request: VerificationRequest = {
    id: `vr-${Date.now()}`,
    userId,
    name: input.name,
    email: input.email,
    uiuEmail: input.uiuEmail,
    uiuIdNumber: input.uiuIdNumber,
    uiuIdImage: input.uiuIdImage,
    status: "pending",
    submittedAt,
  };

  VERIFICATION_REQUESTS.unshift(request);
  return {
    user: existingIndex >= 0 ? MOCK_USERS[existingIndex] : MOCK_USERS[0],
    request,
  };
}

export async function getVerificationRequests(): Promise<
  VerificationRequest[]
> {
  if (!USE_MOCK) {
    return apiClient<VerificationRequest[]>("/verifications/");
  }

  await wait();
  return [...VERIFICATION_REQUESTS].sort((a, b) => {
    if (a.status === "pending" && b.status !== "pending") {
      return -1;
    }
    if (a.status !== "pending" && b.status === "pending") {
      return 1;
    }
    return (
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  });
}

export async function approveVerificationRequest(
  requestId: string,
  adminNote?: string,
): Promise<{
  request?: VerificationRequest;
  user?: MockUser;
}> {
  if (!USE_MOCK) {
    return apiClient<{ request?: VerificationRequest; user?: MockUser }>(
      `/verifications/${requestId}/approve/`,
      {
        data: { adminNote },
      },
    );
  }

  await wait(300);
  const request = VERIFICATION_REQUESTS.find((item) => item.id === requestId);
  if (!request) {
    return {};
  }

  request.status = "approved";
  request.reviewedAt = new Date().toISOString();
  request.adminNote = adminNote || undefined;

  const user = MOCK_USERS.find((entry) => entry.id === request.userId);
  if (user) {
    user.verificationStatus = "verified";
    user.isVerified = true;
    user.verificationReviewedAt = request.reviewedAt;
    user.verificationNote = undefined;
  }

  return { request, user };
}

export async function rejectVerificationRequest(
  requestId: string,
  adminNote?: string,
): Promise<{
  request?: VerificationRequest;
  user?: MockUser;
}> {
  if (!USE_MOCK) {
    return apiClient<{ request?: VerificationRequest; user?: MockUser }>(
      `/verifications/${requestId}/reject/`,
      {
        data: { adminNote },
      },
    );
  }

  await wait(300);
  const request = VERIFICATION_REQUESTS.find((item) => item.id === requestId);
  if (!request) {
    return {};
  }

  request.status = "rejected";
  request.reviewedAt = new Date().toISOString();
  request.adminNote =
    adminNote || "Please review and resubmit your verification.";

  const user = MOCK_USERS.find((entry) => entry.id === request.userId);
  if (user) {
    user.verificationStatus = "rejected";
    user.isVerified = false;
    user.verificationReviewedAt = request.reviewedAt;
    user.verificationNote = request.adminNote;
  }

  return { request, user };
}

export type OrderSummary = {
  id: string;
  totalAmount: number;
  fee: number;
  status: string;
  createdAt: string;
  itemCount: number;
};

export type OrderItem = {
  id: string;
  itemId: string;
  title?: string;
  type?: string;
  image?: string;
  priceAtPurchase: number;
};

export type OrderDetail = {
  id: string;
  totalAmount: number;
  fee: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
};

export type ReviewEntry = {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar?: string;
  sellerId: string;
  itemId?: string;
  itemTitle?: string;
  rating: number;
  comment?: string;
  createdAt: string;
};

export async function updateUserProfile(
  userId: string,
  input: Partial<{
    name: string;
    phone: string;
    address: string;
    bio: string;
    university: string;
    major: string;
    graduationYear: string;
    avatar: string;
  }>,
): Promise<MockUser> {
  return apiClient<MockUser>(`/users/${userId}`, { method: "PUT", data: input });
}

export async function addToCart(itemId: string): Promise<void> {
  await apiClient<void>("/cart/", { method: "POST", data: { itemId } });
}

export async function removeFromCart(itemId: string): Promise<void> {
  await apiClient<void>(`/cart/${itemId}`, { method: "DELETE" });
}

export async function createOrder(): Promise<{
  orderId: string;
  total: number;
  fee: number;
  subtotal: number;
  itemCount: number;
}> {
  return apiClient<{
    orderId: string;
    total: number;
    fee: number;
    subtotal: number;
    itemCount: number;
  }>("/orders/", { method: "POST" });
}

export async function getOrders(): Promise<OrderSummary[]> {
  const orders = await apiClient<any[]>("/orders/");
  return orders.map((order) => ({
    id: order.id,
    totalAmount: Number(order.total_amount ?? order.totalAmount ?? 0),
    fee: Number(order.fee ?? 0),
    status: order.status,
    createdAt: order.created_at ?? order.createdAt,
    itemCount: Number(order.item_count ?? order.itemCount ?? 0),
  }));
}

export async function getOrderById(orderId: string): Promise<OrderDetail> {
  const order = await apiClient<any>(`/orders/${orderId}`);
  return {
    id: order.id,
    totalAmount: Number(order.total_amount ?? order.totalAmount ?? 0),
    fee: Number(order.fee ?? 0),
    status: order.status,
    createdAt: order.created_at ?? order.createdAt,
    items: (order.items ?? []).map((item: any) => ({
      id: item.id,
      itemId: item.item_id ?? item.itemId,
      title: item.title,
      type: item.type,
      image: item.image_url ?? item.image,
      priceAtPurchase: Number(item.price_at_purchase ?? item.priceAtPurchase ?? 0),
    })),
  };
}

export async function getReviewsBySellerId(
  sellerId: string,
): Promise<ReviewEntry[]> {
  return apiClient<ReviewEntry[]>(`/reviews/?seller=${sellerId}`);
}

export async function submitReview(input: {
  sellerId: string;
  itemId?: string;
  rating: number;
  comment?: string;
}): Promise<ReviewEntry> {
  return apiClient<ReviewEntry>("/reviews/", { method: "POST", data: input });
}

export async function addFavorite(itemId: string): Promise<void> {
  await apiClient<void>("/favorites/", { method: "POST", data: { itemId } });
}

export async function removeFavorite(itemId: string): Promise<void> {
  await apiClient<void>(`/favorites/${itemId}`, { method: "DELETE" });
}

export async function joinSubscriptionGroup(
  groupId: string,
): Promise<SubscriptionGroup> {
  return apiClient<SubscriptionGroup>(`/co-subs/${groupId}/join`, {
    method: "POST",
  });
}

export async function leaveSubscriptionGroup(
  groupId: string,
): Promise<SubscriptionGroup> {
  return apiClient<SubscriptionGroup>(`/co-subs/${groupId}/leave`, {
    method: "DELETE",
  });
}
