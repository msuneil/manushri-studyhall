import { 
  signInWithEmailAndPassword, 
  signOut, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged as firebaseOnAuthStateChanged
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth } from '../../lib/firebase/auth';
import { db } from '../../lib/firebase/firestore';
import type { AppUser } from '../../store/authStore';

export const mapFirebaseUserToAppUser = (firebaseUser: User | null): AppUser | null => {
  if (!firebaseUser) return null;
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
  };
};

export const normalizeAuthError = (error: any): string => {
  console.error('Auth error:', error);
  const code = error?.code;
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/email-already-in-use':
      return 'This email address is already in use.';
    case 'auth/weak-password':
      return 'The password is too weak. Min 6 characters required.';
    case 'auth/network-request-failed':
      return 'Network failure. Please check your internet connection.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    default:
      return error?.message || 'An unexpected error occurred.';
  }
};

export const authService = {
  login: async (email: string, password: string): Promise<AppUser> => {
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const appUser = mapFirebaseUserToAppUser(credential.user);
      if (!appUser) throw new Error('Failed to map authenticated user.');
      return appUser;
    } catch (error: any) {
      throw new Error(normalizeAuthError(error));
    }
  },

  logout: async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error(normalizeAuthError(error));
    }
  },

  signup: async (email: string, password: string, hallName: string): Promise<AppUser> => {
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = credential.user.uid;
      const now = new Date().toISOString();

      // 1. Initialize Hall document scoped by UID
      await setDoc(doc(db, 'halls', uid), {
        id: uid,
        name: hallName,
        logo: '',
        phone: '+91 98765 43210',
        email: email,
        address: 'Edit your hall address in settings',
        createdAt: now,
        updatedAt: now,
        createdBy: uid,
        updatedBy: uid,
      });

      // 2. Initialize Default Settings doc scoped by UID
      await setDoc(doc(db, 'settings', uid), {
        hallId: uid,
        hallDetails: {
          name: hallName,
          logo: '',
          phone: '+91 98765 43210',
          email: email,
          address: 'Edit your hall address in settings',
        },
        ownerDetails: {
          name: 'Owner Name',
          role: 'Founder & Administrator',
          phone: '+91 98765 00000',
          email: email,
         },
        paymentSettings: {
          defaultMonthlyFee: 2000,
          dueDateDay: 5,
          gracePeriodDays: 3,
          lateFeeAmount: 200,
          reminderTemplate: `*${hallName.toUpperCase()} - FEE REMINDER* 🎓\n` +
            `-----------------------------------------\n` +
            `👤 *Occupant:* {name}\n` +
            `💺 *Seat Number:* {seatNumber}\n` +
            `📅 *Month:* {month}\n` +
            `💰 *Pending Amount:* ₹{amount}\n` +
            `🗓️ *Due Date:* {dueDate}\n` +
            `-----------------------------------------\n` +
            `Please settle your dues at the earliest. Thank you! 🙏`
        },
        attendanceSettings: {
          openingTime: '06:00',
          closingTime: '22:00',
          attendanceGracePeriodMinutes: 30,
          autoMarkAbsent: true,
        },
        roomDefaults: {
          defaultSeatCount: 40,
          acEnabled: true,
          defaultAmenities: 'WiFi, Power Backup, RO Water',
          commonRules: "1. No noise in the hall.\n2. Maintain cleanliness.\n3. Mobile on silent mode.",
          autoOccupancy: true,
        }
      });

      const appUser = mapFirebaseUserToAppUser(credential.user);
      if (!appUser) throw new Error('Failed to map registered user.');
      return appUser;
    } catch (error: any) {
      throw new Error(normalizeAuthError(error));
    }
  },

  onAuthStateChanged: (callback: (appUser: AppUser | null) => void): (() => void) => {
    return firebaseOnAuthStateChanged(auth, (firebaseUser) => {
      callback(mapFirebaseUserToAppUser(firebaseUser));
    });
  }
};

export default authService;
