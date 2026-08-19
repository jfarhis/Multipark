import {
  bigint,
  boolean,
  doublePrecision,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const projectStatus = pgEnum("project_status", [
  "pre-construction",
  "in-progress",
  "delayed",
  "complete",
]);

export const documentType = pgEnum("document_type", [
  "receipt",
  "report",
  "photo",
]);

export const investors = pgTable("investors", {
  id: text("id").primaryKey(),
  clerkUserId: text("clerk_user_id").unique(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  bankDetails: text("bank_details").notNull().default("Not provided"),
  distributionNotices: boolean("distribution_notices").notNull().default(true),
  constructionUpdates: boolean("construction_updates").notNull().default(true),
  documentNotices: boolean("document_notices").notNull().default(true),
  monthlyDigest: boolean("monthly_digest").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  status: projectStatus("status").notNull(),
  constructionPct: doublePrecision("construction_pct").notNull().default(0),
  occupancyPct: doublePrecision("occupancy_pct").notNull().default(0),
  budgetTotal: bigint("budget_total", { mode: "number" }).notNull(),
  estimatedCompletionDate: text("estimated_completion_date").notNull(),
  projectedIrr: doublePrecision("projected_irr").notNull().default(0),
  budgetBreakdown: jsonb("budget_breakdown")
    .$type<{ label: string; amount: number }[]>()
    .notNull()
    .default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const investorProjectStakes = pgTable(
  "investor_project_stakes",
  {
    investorId: text("investor_id")
      .notNull()
      .references(() => investors.id, { onDelete: "cascade" }),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    stakePct: doublePrecision("stake_pct").notNull(),
    capitalCommitted: bigint("capital_committed", { mode: "number" }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.investorId, table.projectId] })],
);

export const distributions = pgTable("distributions", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  investorId: text("investor_id")
    .notNull()
    .references(() => investors.id, { onDelete: "cascade" }),
  amount: bigint("amount", { mode: "number" }).notNull(),
  date: text("date").notNull(),
  receiptPathname: text("receipt_pathname"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const documents = pgTable("documents", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  investorId: text("investor_id").references(() => investors.id, {
    onDelete: "cascade",
  }),
  title: text("title").notNull(),
  pathname: text("pathname"),
  externalUrl: text("external_url"),
  uploadedDate: text("uploaded_date").notNull(),
  type: documentType("type").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
