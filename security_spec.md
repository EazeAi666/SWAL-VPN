# Security Specification: SWAL VPN

## Data Invariants
1. A user profile MUST be owned by the authenticated user.
2. The `isAdmin` field cannot be modified by the user themselves.
3. The `tier` field is currently restricted to 'standard'.

## Dirty Dozen Payloads (Target: /users/{userId})

1. **Identity Spoofing**: Create a profile for another UID.
   - `uid: "attacker"`, `data: { email: "attacker@test.com", tier: "standard", ... }` at `/users/victim_id`
2. **Privilege Escalation**: Update own profile to set `isAdmin: true`.
   - `patch: { isAdmin: true }`
3. **Resource Poisoning**: Extremely long email string (1MB).
   - `{ email: "a".repeat(1000000), ... }`
4. **Invalid ID**: Use an ID with special characters like `/` or `..`.
   - `/users/bad%2Fid`
5. **Missing Fields**: Create without `expiryDate`.
   - `{ email: "test@test.com", tier: "standard" }`
6. **Future Spoofing**: Setting `expiryDate` to the year 3000 without being admin.
   - `{ expiryDate: Timestamp(3000, 0, 1) }`
7. **Tier Hijack**: Trying to set tier to 'premium' via client.
   - `{ tier: "premium" }`
8. **Shadow Fields**: Adding `isVerified: true` to a create payload.
   - `{ ..., isVerified: true }`
9. **Email Spoofing (Verification)**: Using an admin email without `email_verified` check.
10. **Type Poisoning**: `tier: true` instead of string.
11. **Timestamp Manipulation**: Sending a client-side `updatedAt` that doesn't match `request.time`.
12. **Orphaned Write**: Creating a user without a valid auth session.

## Test Runner Logic
The `firestore.rules` will be updated to block all these.
