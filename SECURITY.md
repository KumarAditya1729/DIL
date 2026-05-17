# Security Best Practices & RLS

## 1. Tenant Isolation
Cross-tenant access is physically impossible at the application layer due to PostgreSQL Row Level Security (RLS). 

Example Policy:
```sql
CREATE POLICY "Tenant isolation for students" 
ON students FOR ALL 
USING (academy_id = get_current_academy_id());
```

## 2. API Protection
- **Server Actions**: All Server Actions must independently verify the user's session before performing mutations, preventing IDOR (Insecure Direct Object Reference) attacks.
- **Webhooks**: External webhooks (e.g., Razorpay) use HMAC SHA256 cryptographic signatures to guarantee payload authenticity.

## 3. Data Protection
- **CSRF**: Next.js automatically implements CSRF protection on Server Actions.
- **XSS**: React automatically escapes rendering outputs, mitigating XSS. Content Security Policies (CSP) are configured in `next.config.mjs`.

## 4. Audit Logging
Every sensitive mutation (Subscription Renewal, Role Change, Student Deletion) writes an immutable record to the `audit_logs` table for forensic analysis.
