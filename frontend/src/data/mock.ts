export const MARKETPLACE_ITEMS = [
  { id: '1', title: 'CSE 111 Programming Fundamentals (UIU)', type: 'sell', price: 35, condition: 'Good', category: 'Textbooks', seller: 'Ayesha M.', sellerId: 'u1', sellerRating: 4.8, reviewsCount: 12, description: 'Used in UIU CSE 111. Light highlights, clean pages. Meet at the UIU library gate.', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop', sellerLastActive: 'Active Now' },
  { id: '2', title: 'EEE 101 Circuit Theory Notes (UIU)', type: 'share', price: 0, condition: 'Good', category: 'Course Notes', seller: 'Nafis R.', sellerId: 'u2', sellerRating: 4.7, reviewsCount: 9, description: 'Organized lecture notes for EEE 101. Can share soft copy after verification.', image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=800&auto=format&fit=crop', sellerLastActive: 'Active 2h ago' },
  { id: '3', title: 'Casio fx-991EX Scientific Calculator', type: 'sell', price: 18, condition: 'Like New', category: 'Calculators', seller: 'Shaila H.', sellerId: 'u3', sellerRating: 4.9, reviewsCount: 5, description: 'Used for one trimester. Approved for UIU engineering exams. Includes cover.', image: 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?q=80&w=800&auto=format&fit=crop', sellerLastActive: 'Active 1d ago' },
  { id: '4', title: 'PHY 109 Lab Coat + Goggles', type: 'sell', price: 12, condition: 'Good', category: 'Lab Gear', seller: 'Rahim S.', sellerId: 'u4', sellerRating: 4.6, reviewsCount: 8, description: 'UIU lab essentials in good condition. Pickup near main gate.', image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?q=80&w=800&auto=format&fit=crop', sellerLastActive: 'Active Now' },
  { id: '5', title: 'STA 101 Formula Sheet Pack', type: 'barter', exchangeFor: 'CSE 115 notes', price: 0, condition: 'Good', category: 'Course Notes', seller: 'Mubin T.', sellerId: 'u5', sellerRating: 4.4, reviewsCount: 3, description: 'Printed and handwritten formula sheets. Swap for CSE 115 notes.', image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?q=80&w=800&auto=format&fit=crop', sellerLastActive: 'Active 5h ago' },
  { id: '6', title: 'BBA 201 Marketing Principles (12th Ed)', type: 'sell', price: 28, condition: 'Like New', category: 'Textbooks', seller: 'Imran P.', sellerId: 'u6', sellerRating: 4.7, reviewsCount: 15, description: 'Required for BBA 201. Clean and no markings. UIU pickup preferred.', image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=800&auto=format&fit=crop', sellerLastActive: 'Active 3d ago' },
  { id: '7', title: 'Arduino Starter Kit (EEE 201)', type: 'sell', price: 25, condition: 'Good', category: 'Project Kits', seller: 'Rafi T.', sellerId: 'u7', sellerRating: 4.5, reviewsCount: 6, description: 'Complete kit used in UIU EEE 201. Includes sensors and breadboard.', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop', sellerLastActive: 'Active 6h ago' },
];

export const SUBSCRIPTION_GROUPS = [
  { id: '1', service: 'Spotify Family', type: 'share', totalPrice: 15.00, pricePerMonth: 2.50, totalSpots: 6, filledSpots: 5, owner: 'Nila K.', icon: 'Music', description: 'UIU batch 231 group. Need one more student to finish the family plan.' },
  { id: '2', service: 'Netflix Premium', type: 'share', totalPrice: 20.00, pricePerMonth: 5.00, totalSpots: 4, filledSpots: 3, owner: 'Ayesha M.', icon: 'Tv', description: 'UIU students only. Billed monthly. One spot open.' },
  { id: '3', service: 'Chegg Study', type: 'sublet', duration: 3, totalPrice: 14.95, pricePerMonth: 4.99, totalSpots: 1, filledSpots: 0, owner: 'Mubin T.', icon: 'BookOpen', description: 'Subletting for the next trimester. UIU email required.' },
  { id: '4', service: 'Notion Plus', type: 'share', totalPrice: 10.00, pricePerMonth: 2.00, totalSpots: 5, filledSpots: 4, owner: 'Shaila H.', icon: 'FileText', description: 'UIU study group workspace. One spot left.' },
  { id: '5', service: 'Adobe Creative Cloud', type: 'sublet', duration: 6, totalPrice: 30.00, pricePerMonth: 15.00, totalSpots: 1, filledSpots: 0, owner: 'Rahim S.', icon: 'PenTool', description: 'Subletting my student plan for 6 months. UIU verification required.' },
];

export const REVIEWS = [
  { id: 'r1', targetId: '1', targetType: 'item', author: 'Arif D.', authorId: 'u1', rating: 5, comment: 'Great book, met at UIU library gate.', date: '2026-03-16T10:00:00Z' },
  { id: 'r2', targetId: '3', targetType: 'item', author: 'Nadia R.', authorId: 'u2', rating: 4, comment: 'Calculator was clean and ready for exam week.', date: '2026-03-19T14:30:00Z' },
];

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  isVerified: boolean;
  joinedDate: string;
  avatar?: string;
  address?: string;
  phone?: string;
  bio?: string;
  university?: string;
  major?: string;
  graduationYear?: string;
  uiuEmail?: string;
  uiuIdNumber?: string;
  uiuIdImage?: string;
  verificationNote?: string;
  verificationSubmittedAt?: string;
  verificationReviewedAt?: string;
}

export const MOCK_USERS: MockUser[] = [
  {
    id: 'admin-1',
    name: 'UIU Admin',
    email: 'admin@uiu.ac.bd',
    role: 'admin',
    verificationStatus: 'verified',
    isVerified: true,
    uiuEmail: 'admin@uiu.ac.bd',
    uiuIdNumber: 'UIU-0001',
    joinedDate: 'April 2026',
  },
  {
    id: 'u1',
    name: 'Ayesha M.',
    email: 'ayesha@uiu.ac.bd',
    role: 'user',
    verificationStatus: 'verified',
    isVerified: true,
    uiuEmail: 'ayesha@uiu.ac.bd',
    uiuIdNumber: 'UIU-21433',
    uiuIdImage: 'uiu-id-ayesha.jpg',
    verificationSubmittedAt: '2026-03-04T08:15:00Z',
    verificationReviewedAt: '2026-03-05T10:30:00Z',
    joinedDate: 'March 2026',
  },
  {
    id: 'u2',
    name: 'Nafis R.',
    email: 'nafis@gmail.com',
    role: 'user',
    verificationStatus: 'pending',
    isVerified: false,
    uiuEmail: 'nafis@uiu.ac.bd',
    uiuIdNumber: 'UIU-21980',
    uiuIdImage: 'uiu-id-nafis.jpg',
    verificationSubmittedAt: '2026-04-26T09:20:00Z',
    joinedDate: 'April 2026',
  },
  {
    id: 'u3',
    name: 'Shaila H.',
    email: 'shaila@gmail.com',
    role: 'user',
    verificationStatus: 'rejected',
    isVerified: false,
    uiuEmail: 'shaila@uiu.ac.bd',
    uiuIdNumber: 'UIU-21510',
    uiuIdImage: 'uiu-id-shaila.jpg',
    verificationSubmittedAt: '2026-04-24T07:50:00Z',
    verificationReviewedAt: '2026-04-25T11:10:00Z',
    verificationNote: 'Please upload a clearer ID card photo.',
    joinedDate: 'April 2026',
  },
];

export const VERIFICATION_REQUESTS = [
  {
    id: 'vr-1003',
    userId: 'u1',
    name: 'Ayesha M.',
    email: 'ayesha@uiu.ac.bd',
    uiuEmail: 'ayesha@uiu.ac.bd',
    uiuIdNumber: 'UIU-21433',
    uiuIdImage: 'uiu-id-ayesha.jpg',
    status: 'approved',
    submittedAt: '2026-03-04T08:15:00Z',
    reviewedAt: '2026-03-05T10:30:00Z',
  },
  {
    id: 'vr-1001',
    userId: 'u2',
    name: 'Nafis R.',
    email: 'nafis@gmail.com',
    uiuEmail: 'nafis@uiu.ac.bd',
    uiuIdNumber: 'UIU-21980',
    uiuIdImage: 'uiu-id-nafis.jpg',
    status: 'pending',
    submittedAt: '2026-04-26T09:20:00Z',
  },
  {
    id: 'vr-1002',
    userId: 'u3',
    name: 'Shaila H.',
    email: 'shaila@gmail.com',
    uiuEmail: 'shaila@uiu.ac.bd',
    uiuIdNumber: 'UIU-21510',
    uiuIdImage: 'uiu-id-shaila.jpg',
    status: 'rejected',
    submittedAt: '2026-04-24T07:50:00Z',
    reviewedAt: '2026-04-25T11:10:00Z',
    adminNote: 'Please upload a clearer ID card photo.',
  },
];
