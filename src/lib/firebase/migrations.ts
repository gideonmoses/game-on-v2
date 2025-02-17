import { db } from './firebase-admin';
import type { User, UserRole } from '@/types/firestore';

export async function migrateUserRoles() {
  const usersRef = db.collection('users');
  const snapshot = await usersRef.get();
  const batch = db.batch();

  for (const doc of snapshot.docs) {
    const userData = doc.data();
    
    // If document has old 'role' field but no 'roles' array
    if (userData.role && (!userData.roles || !userData.roles.length)) {
      const newRoles: UserRole[] = [userData.role as UserRole];
      
      batch.update(doc.ref, {
        roles: newRoles,
        role: db.FieldValue.delete(), // Remove the old field
        updatedAt: new Date().toISOString()
      });
    }
    // If document has neither role nor roles
    else if (!userData.roles) {
      batch.update(doc.ref, {
        roles: ['player'], // Default role
        updatedAt: new Date().toISOString()
      });
    }
  }

  await batch.commit();
}

export async function fixUserDocuments() {
  const usersRef = db.collection('users');
  const snapshot = await usersRef.get();
  const batch = db.batch();

  for (const doc of snapshot.docs) {
    const userData = doc.data();
    const updates: Partial<User> = {};

    // Add missing fields with default values
    if (!userData.roles) updates.roles = ['player'];
    if (!userData.approvalStatus) updates.approvalStatus = 'pending';
    if (!userData.emailVerified) updates.emailVerified = false;
    if (!userData.subscriptionStatus) updates.subscriptionStatus = 'inactive';
    if (!userData.emergencyContact) {
      updates.emergencyContact = {
        name: '',
        relationship: '',
        phone: ''
      };
    }

    // Only update if there are missing fields
    if (Object.keys(updates).length > 0) {
      updates.updatedAt = new Date().toISOString();
      batch.update(doc.ref, updates);
    }
  }

  await batch.commit();
} 