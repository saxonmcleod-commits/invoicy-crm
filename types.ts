import React from 'react';

// Note: These types are manually defined to match the Supabase schema.
// In a larger project, you could generate these from your database schema.

export interface Profile {
  id: string; // UUID from auth.users
  subscription_tier: 'free' | 'pro';
  stripe_customer_id?: string;
  company_name?: string;
  company_address?: string;
  company_email?: string;
  company_abn?: string;
  company_logo?: string;
  dark_mode?: boolean;
  color_theme?: string;
  common_tags?: string[];
}

export interface ActivityLog {
  id: string;
  user_id: string;
  customer_id: string;
  type: 'Call' | 'Email' | 'Meeting' | 'Note' | 'Task';
  content: string;
  date: string; // ISO string
  subject?: string;
  link?: string;
  attendees?: string;
  created_at: string;
}

export interface Customer {
  id: string; // UUID from Supabase
  user_id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  tags?: string[];
  preferences?: string[];
  activityLog?: ActivityLog[];
  created_at: string;
}

export interface DocumentItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  sourceExpenseId?: string;
}

export enum DocumentType {
  Invoice = 'Invoice',
  Quote = 'Quote',
}

export enum DocumentStatus {
  Draft = 'Draft',
  Sent = 'Sent',
  Paid = 'Paid',
  Overdue = 'Overdue',
}

export interface Recurrence {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  endDate?: string;
}

export interface Document {
  id: string; // UUID from Supabase
  user_id: string;
  doc_number: string;
  customer_id: string;
  customer: Customer | null; // This will be populated after fetching via a join
  items: DocumentItem[];
  issue_date: string;
  due_date: string;
  type: DocumentType;
  status: DocumentStatus;
  notes?: string;
  template_id: string;
  subtotal: number;
  tax: number;
  total: number;
  recurrence?: Recurrence;
  archived?: boolean;
  created_at: string;
}

export interface BusinessLetter {
  id: string;
  user_id: string;
  doc_number: string;
  customer_id: string;
  customer: Customer | null; // Populated by join
  issue_date: string;
  subject: string;
  body: string;
  type: 'BusinessLetter';
  archived?: boolean;
  created_at: string;
}

// Overwrite the customer property to be nullable for new docs/letters before they're saved
export type NewDocumentData = Omit<
  Document,
  'id' | 'doc_number' | 'customer_id' | 'created_at' | 'user_id' | 'customer'
> & { customer: Customer | null };
export type NewBusinessLetterData = Omit<
  BusinessLetter,
  'id' | 'doc_number' | 'customer_id' | 'created_at' | 'user_id' | 'customer'
> & { customer: Customer | null };

export interface TemplateInfo {
  id: string;
  name: string;
  previewComponent: React.FC;
}

export interface CompanyInfo {
  name: string;
  address: string;
  email: string;
  abn?: string;
  logo?: string;
}

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  start_time: string; // ISO string
  end_time: string; // ISO string
  color: string;
  meeting_link?: string;
  created_at: string;
}

// FIX: Added missing Task interface export.
export interface Task {
  id: string;
  user_id: string;
  text: string;
  completed: boolean;
  due_date?: string; // ISO string
  created_at: string;
}

export interface EmailTemplate {
  id: string;
  user_id: string;
  name: string;
  subject: string;
  body: string;
  created_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  date: string; // ISO string
  category: string;
  receipt_image?: string; // base64
  customer_id?: string;
  status: 'unbilled' | 'billed' | 'paid' | 'unpaid';
  created_at: string;
}

// ----- PRODUCTIVITY HUB V2 TYPES -----

export interface TableBlock {
  id: string;
  type: 'table';
  data: string[][];
}

export interface ChartBlock {
  id: string;
  type: 'chart';
  chartType: 'bar' | 'pie';
  data: { label: string; value: number }[];
}

export type PageBlock = TableBlock | ChartBlock;

export interface ProductivityPage {
  id: string;
  user_id: string;
  title: string;
  icon?: string | null;
  content: any; // Storing rich text content as JSON from an editor like TipTap
  blocks: PageBlock[];
  customer_id?: string | null;
  created_at: string;
  updated_at: string;
}
// ----- END PRODUCTIVITY HUB V2 -----

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
}

export interface ColorTheme {
  name: string;
  colors: { [key: string]: string };
  swatchColor: string;
}
