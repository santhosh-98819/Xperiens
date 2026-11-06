# Xperiens Security Specification

## Data Invariants
1.  **User Profiles**: Every user must have a profile document at `/users/{userId}` where `{userId}` matches their unique Firebase Auth UID.
2.  **Experiences**: Experiences are publicly readable but can only be created by signed-in users. Only the original author can delete their experience.
3.  **Ownership**: All user-specific data (Problems, Solutions, Feedback, Saved Solutions) must contain a `userId` field that strictly matches the authenticated user's UID.
4.  **Immutability**: The `userId` and `createdAt` fields on documents should be immutable after creation.
5.  **Timestamps**: All `createdAt` and `updatedAt` fields must use server-side timestamps.

## The "Dirty Dozen" (Test Payloads)
1.  **Identity Spoofing**: Attempting to create a user profile for a different UID.
2.  **Unauthorized Update**: Attempting to update another user's profile bio.
3.  **Ghost Experience**: Attempting to create an experience without being signed in.
4.  **Author Impersonation**: Attempting to create an experience with a `userId` that doesn't match the current auth.
5.  **Illegal Deletion**: Attempting to delete an experience authored by someone else.
6.  **Shadow Solution**: Attempting to read another user's private solution analysis.
7.  **Data Poisoning**: Attempting to inject a 1MB string into a category field.
8.  **Status Shortcut**: Attempting to mark a solution as "completed" without having first created it in "in_progress".
9.  **Orphaned Feedback**: Attempting to create outcome feedback for a solution that doesn't exist.
10. **Global Write**: Attempting to write to a non-existent collection.
11. **Email Spoofing**: Accessing admin features (if any) with an unverified email.
12. **Array Overflow**: Adding 1000 tags to an experience.

## Rules Implementation Strategy
- Use a default-deny catch-all rule.
- Implement validation helpers for every entity.
- Enforce strict key checks and type safety.
- Restrict list queries to owned resources.
