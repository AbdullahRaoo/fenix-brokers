Project Functional Specifications: B2B E-Commerce & Email Automation
1. System Architecture & Tech Constraints
Framework: Next.js 14+ (App Router).

Language: TypeScript (Strict Mode).

Data Fetching: React Server Components (RSC) for reads, Server Actions for writes.

Database: PostgreSQL (via Supabase).

State Management: URL search params for filtering; React Context/Zustand for complex editor state.

Email Provider: Resend or SendGrid API.

2. Public Frontend Functionalities
2.1. Navigation & Routing Logic
Routes: /, /products, /product/[slug], /about, /contact.

Global Search: text input accepts strings -> queries database for Product Name or SKU -> returns results list.

Cart/Quote Basket: (If applicable) Session-based storage of product IDs intended for quoting.

2.2. Product Catalog Logic
Filtering Engine: Must support multi-select filtering by Category, Brand, and Availability status.

Sorting: Logic for "Newest", "Price (High/Low)", and "Alphabetical".

Pagination: Offset-based or cursor-based loading for product grids.

2.3. The "Request Quote" System (Critical Flow)
Trigger: User action on a specific product.

Data Passing: The system must capture the product_id context immediately upon trigger.

Form Submission Logic:

Input Validation: Email format check, Required fields (Company, Name, Quantity).

File Handling: Accept PDF/Docx uploads -> Upload to Object Storage (e.g., AWS S3/Supabase Storage) -> Return URL -> Attach URL to Inquiry record.

Database Action: Create new record in inquiries table with status pending.

Notification: Trigger server-side email to Admin Notification Address.

2.4. Subscriber Capture
Logic: Trigger on timer (5s) or exit_intent.

Deduplication: Check if email exists in subscribers table before inserting. If exists, ignore or update timestamp.

Session Persistence: Set a cookie/local storage flag (has_subscribed = true) to prevent re-triggering for 30 days.

3. Admin Dashboard Logic (Private Routes)
3.1. Authentication & Security
Middleware: Protect all /admin/* routes. Redirect unauthenticated users to /login.

Session: Manage Admin session tokens (JWT or Database Sessions).

Mock Credentials (Phase 1): Hardcoded validation check for abdullah / abdullah.

3.2. Product Management (CRUD)
Create/Update Flow:

Slug Generation: Auto-generate URL-friendly slug from Product Name (e.g., "Steel Pipe" -> "steel-pipe"). Check for duplicates.

SEO Data: Save specific meta_title and meta_description fields to the database.

Specs Storage: Store variable technical specifications as a JSONB object or a related relational table (Key: Value) to allow flexible fields per product.

Soft Delete: "Delete" action should toggle a is_archived boolean, not remove data permanently.

3.3. Inquiry CRM Logic
State Machine: Inquiries move through states: New -> Viewed -> In Progress -> Closed.

Reply System:

Admin enters text -> System calls Email API -> Sends email to Customer.

Logging: System appends the message body and timestamp to a message_threads array or relation linked to that Inquiry for audit trails.

4. The Marketing Module (Core Automation)
This module requires strict separation between Template Construction and Campaign Execution.

4.1. Template Management (/templates)
Entity Definition: A "Template" is a saved JSON structure representing the email layout, plus a rendered HTML string.

CRUD: List, Duplicate (critical for workflow), Edit, Delete.

4.2. Advanced Editor Logic (The "Builder")
Drag-and-Drop Engine:

Must maintain a JSON tree of blocks (e.g., [{ type: 'text', content: '...' }, { type: 'product', id: 123 }]).

The "Product Block" Algorithm:

User drags "Product Block" to canvas.

System triggers a "Product Picker" query.

User selects a Product.

Data Injection: System fetches image_url, title, price from DB.

Rendering: System injects these values into a pre-defined HTML component within the email body.

Variable parsing: Support tags like {{subscriber_name}} for personalization.

4.3. Campaign Execution (/campaigns)
Campaign Entity: Links a template_id to a segment_id (or list of emails).

Sending Logic (Backend Job):

Fetch Template HTML.

Fetch Subscriber List.

Loop/Batch: For each subscriber, replace {{variables}} -> Send via Email API.

Status Tracking: Update Campaign status from draft -> sending -> sent.

Logs: Store success_count and failure_count.

5. Database Schema Requirements (Conceptual)
The agent should construct the database based on these relationships:

Products: id, title, slug, price, specs (json), seo_metadata (json), is_active.

Subscribers: id, email, name, subscribed_at, status.

Inquiries: id, product_id (FK), customer_email, message, attachment_url, status, admin_notes.

Email_Templates: id, name, structure_json (for editor), html_content (for sending).

Campaigns: id, template_id (FK), status, sent_at, stats (json).