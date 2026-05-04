import type { Database } from "better-sqlite3";
import bcrypt from "bcryptjs";

const DEFAULT_PASSWORD = "name123";

export function seedDatabase(db: Database) {
  const existing = db
    .prepare("SELECT COUNT(*) as count FROM users")
    .get() as { count: number };
  if (existing.count > 0) {
    return;
  }

  const passwordHash = bcrypt.hashSync(DEFAULT_PASSWORD, 10);
  const now = new Date().toISOString();

  const users = [
    {
      id: "u-admin",
      name: "Ayesha Rahman",
      email: "ayesha@gmail.com",
      role: "admin",
      verificationStatus: "verified",
      uiuEmail: "ayesha@uiu.edu",
      uiuIdNumber: "UIU-1001",
      joinedDate: "January 2024",
    },
    {
      id: "u-seller",
      name: "Nafis Ahmed",
      email: "nafis@gmail.com",
      role: "user",
      verificationStatus: "verified",
      uiuEmail: "nafis@uiu.edu",
      uiuIdNumber: "UIU-1002",
      joinedDate: "February 2024",
    },
    {
      id: "u-buyer",
      name: "Farhana Chowdhury",
      email: "farhana@gmail.com",
      role: "user",
      verificationStatus: "verified",
      uiuEmail: "farhana@uiu.edu",
      uiuIdNumber: "UIU-1003",
      joinedDate: "March 2024",
    },
    {
      id: "u-unverified",
      name: "Imran Hasan",
      email: "imran@gmail.com",
      role: "user",
      verificationStatus: "unverified",
      uiuEmail: "imran@uiu.edu",
      uiuIdNumber: "UIU-1004",
      joinedDate: "April 2024",
    },
    {
      id: "u-student1",
      name: "Tania Sultana",
      email: "tania@gmail.com",
      role: "user",
      verificationStatus: "verified",
      uiuEmail: "tania@uiu.edu",
      uiuIdNumber: "UIU-1005",
      joinedDate: "May 2024",
    },
    {
      id: "u-student2",
      name: "Rafiul Islam",
      email: "rafiul@gmail.com",
      role: "user",
      verificationStatus: "verified",
      uiuEmail: "rafiul@uiu.edu",
      uiuIdNumber: "UIU-1006",
      joinedDate: "May 2024",
    },
  ];

  const listings = [
    {
      id: "item-101",
      sellerId: "u-seller",
      title: "CSE 221 Algorithms Workbook",
      type: "sell",
      price: 18,
      condition: "Good",
      category: "Textbooks",
      description: "Clean notes, solved problems, and past exam highlights.",
      imageUrl:
        "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "item-102",
      sellerId: "u-seller",
      title: "EEE Lab Toolkit",
      type: "sell",
      price: 32,
      condition: "Like New",
      category: "Lab Gear",
      description: "Multimeter, jumper wires, and quick-reference guide.",
      imageUrl:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "item-103",
      sellerId: "u-student1",
      title: "UIU Calculus Note Pack",
      type: "share",
      price: 0,
      condition: "Good",
      category: "Course Notes",
      description: "Weekly summary sheets and exam prep cards.",
      imageUrl:
        "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "item-104",
      sellerId: "u-student2",
      title: "Project Kit: Arduino Starter",
      type: "barter",
      price: 0,
      condition: "New",
      category: "Project Kits",
      description: "Open to trade for design tools or lab hours.",
      imageUrl:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "item-105",
      sellerId: "u-buyer",
      title: "Linear Algebra Flashcards",
      type: "sell",
      price: 9,
      condition: "Good",
      category: "Course Notes",
      description: "Compact formula deck with solved examples.",
      imageUrl:
        "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "item-106",
      sellerId: "u-student1",
      title: "Physics Lab Report Template",
      type: "share",
      price: 0,
      condition: "Good",
      category: "Lab Gear",
      description: "Editable doc with rubric tips and formatting.",
      imageUrl:
        "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&q=80",
    },
  ];

  const groups = [
    {
      id: "group-201",
      ownerId: "u-student1",
      service: "Spotify Family Plan",
      type: "share",
      totalPrice: 12.0,
      totalSpots: 6,
      description: "Need 4 more members, payment via bKash.",
      durationMonths: 6,
      icon: "Music",
    },
    {
      id: "group-202",
      ownerId: "u-student2",
      service: "UIU Hostel Sublet",
      type: "sublet",
      totalPrice: 120.0,
      totalSpots: 1,
      description: "Single seat, utilities included.",
      durationMonths: 3,
      icon: "Key",
    },
  ];

  const groupMembers = [
    { id: "gm-1", groupId: "group-201", userId: "u-student1" },
    { id: "gm-2", groupId: "group-201", userId: "u-buyer" },
  ];

  const reviews = [
    {
      id: "review-301",
      reviewerId: "u-buyer",
      sellerId: "u-seller",
      itemId: "item-101",
      rating: 5,
      comment: "Great condition and super helpful notes!",
      createdAt: now,
    },
    {
      id: "review-302",
      reviewerId: "u-student1",
      sellerId: "u-seller",
      itemId: "item-102",
      rating: 4,
      comment: "Everything worked well, quick handoff.",
      createdAt: now,
    },
  ];

  const insertUser = db.prepare(`
    INSERT INTO users (
      id, name, email, password_hash, role, avatar, phone, address, bio,
      university, major, graduation_year, uiu_email, uiu_id_number, uiu_id_image,
      verification_status, verification_note, verification_submitted_at,
      verification_reviewed_at, joined_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertListing = db.prepare(`
    INSERT INTO marketplace_items (
      id, seller_id, title, type, price, exchange_for, condition, category,
      description, image_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertGroup = db.prepare(`
    INSERT INTO subscription_groups (
      id, owner_id, service, type, total_price, total_spots, description,
      duration_months, icon
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertGroupMember = db.prepare(
    "INSERT INTO group_members (id, group_id, user_id) VALUES (?, ?, ?)",
  );

  const insertReview = db.prepare(`
    INSERT INTO reviews (
      id, reviewer_id, seller_id, item_id, rating, comment, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const seedTx = db.transaction(() => {
    for (const user of users) {
      insertUser.run(
        user.id,
        user.name,
        user.email,
        passwordHash,
        user.role,
        null,
        null,
        null,
        null,
        "United International University",
        "Computer Science",
        "2026",
        user.uiuEmail,
        user.uiuIdNumber,
        null,
        user.verificationStatus,
        null,
        user.verificationStatus === "verified" ? now : null,
        user.verificationStatus === "verified" ? now : null,
        user.joinedDate,
      );
    }

    for (const listing of listings) {
      insertListing.run(
        listing.id,
        listing.sellerId,
        listing.title,
        listing.type,
        listing.price,
        null,
        listing.condition,
        listing.category,
        listing.description,
        listing.imageUrl,
      );
    }

    for (const group of groups) {
      insertGroup.run(
        group.id,
        group.ownerId,
        group.service,
        group.type,
        group.totalPrice,
        group.totalSpots,
        group.description,
        group.durationMonths,
        group.icon,
      );
    }

    for (const member of groupMembers) {
      insertGroupMember.run(member.id, member.groupId, member.userId);
    }

    for (const review of reviews) {
      insertReview.run(
        review.id,
        review.reviewerId,
        review.sellerId,
        review.itemId,
        review.rating,
        review.comment,
        review.createdAt,
      );
    }
  });

  seedTx();

  console.log("[db] Seeded demo data for users, listings, groups, and reviews.");
}
