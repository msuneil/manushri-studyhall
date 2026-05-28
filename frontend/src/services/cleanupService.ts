import { collection, query, where, getDocs, doc, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase/firestore';

/**
 * Safely cleans up duplicated bootstrap/demo records from Firestore for the given hallId
 * while meticulously preserving legitimate user-created operational records.
 */
export const runProductionCleanup = async (hallId: string): Promise<void> => {
  if (!hallId) return;

  try {
    console.log(`[runProductionCleanup] Starting safe data cleanup pass for hall: ${hallId}`);
    const batch = writeBatch(db);
    const now = new Date().toISOString();
    let hasChanges = false;

    // --- 1. CLEANUP DUPLICATED ROOMS ---
    const roomsRef = collection(db, 'rooms');
    const roomsQuery = query(roomsRef, where('hallId', '==', hallId), where('isActive', '==', true));
    const roomsSnap = await getDocs(roomsQuery);
    
    const roomsList: any[] = [];
    roomsSnap.forEach(snap => {
      roomsList.push({ id: snap.id, ...snap.data() });
    });

    // Group rooms by name to detect duplicate demo halls
    const roomsByName: Record<string, any[]> = {};
    roomsList.forEach(room => {
      const name = room.name || '';
      if (!roomsByName[name]) roomsByName[name] = [];
      roomsByName[name].push(room);
    });

    const duplicateRoomIds = new Set<string>();
    const keptRoomIds = new Set<string>();

    Object.keys(roomsByName).forEach(name => {
      const roomsGroup = roomsByName[name];
      if (roomsGroup.length > 1) {
        // Sort by createdAt ascending (keep the oldest one)
        roomsGroup.sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return aTime - bTime;
        });

        const oldestRoom = roomsGroup[0];
        keptRoomIds.add(oldestRoom.id);
        console.log(`[runProductionCleanup] Keeping oldest room "${name}" (ID: ${oldestRoom.id})`);

        // Soft-delete the remaining duplicate rooms
        for (let i = 1; i < roomsGroup.length; i++) {
          const dupRoom = roomsGroup[i];
          duplicateRoomIds.add(dupRoom.id);
          
          batch.update(doc(db, 'rooms', dupRoom.id), {
            isActive: false,
            deletedAt: now,
            archivedAt: now,
            updatedAt: now
          });
          hasChanges = true;
          console.warn(`[runProductionCleanup] Soft-deleting duplicate room "${name}" (ID: ${dupRoom.id})`);
        }
      } else if (roomsGroup.length === 1) {
        keptRoomIds.add(roomsGroup[0].id);
      }
    });

    // --- 2. CLEANUP DUPLICATED SEATS ---
    const seatsRef = collection(db, 'seats');
    const seatsQuery = query(seatsRef, where('hallId', '==', hallId), where('isActive', '==', true));
    const seatsSnap = await getDocs(seatsQuery);

    const seatsList: any[] = [];
    seatsSnap.forEach(snap => {
      seatsList.push({ id: snap.id, ...snap.data() });
    });

    // Group seats by roomId and number to detect duplicates
    const seatsByRoomAndNumber: Record<string, any[]> = {};

    seatsList.forEach(seat => {
      // If seat belongs to a duplicated room we already soft-deleted, soft-delete it too
      if (duplicateRoomIds.has(seat.roomId)) {
        batch.update(doc(db, 'seats', seat.id), {
          isActive: false,
          deletedAt: now,
          archivedAt: now,
          updatedAt: now
        });
        hasChanges = true;
        return;
      }

      const key = `${seat.roomId}_${seat.number}`;
      if (!seatsByRoomAndNumber[key]) seatsByRoomAndNumber[key] = [];
      seatsByRoomAndNumber[key].push(seat);
    });

    // Clean up duplicate seats within valid rooms
    Object.keys(seatsByRoomAndNumber).forEach(key => {
      const seatsGroup = seatsByRoomAndNumber[key];
      if (seatsGroup.length > 1) {
        // Sort by createdAt ascending
        seatsGroup.sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return aTime - bTime;
        });

        // Keep the oldest, but prefer keeping the one that is currently occupied if there's any discrepancy
        let keepIndex = 0;
        const occupiedIndex = seatsGroup.findIndex(s => s.isOccupied === true);
        if (occupiedIndex !== -1) {
          keepIndex = occupiedIndex;
        }

        const keptSeat = seatsGroup[keepIndex];
        console.log(`[runProductionCleanup] Keeping seat "${keptSeat.number}" (ID: ${keptSeat.id})`);

        for (let i = 0; i < seatsGroup.length; i++) {
          if (i === keepIndex) continue;
          const dupSeat = seatsGroup[i];
          batch.update(doc(db, 'seats', dupSeat.id), {
            isActive: false,
            deletedAt: now,
            archivedAt: now,
            updatedAt: now
          });
          hasChanges = true;
          console.warn(`[runProductionCleanup] Soft-deleting duplicate seat "${dupSeat.number}" (ID: ${dupSeat.id})`);
        }
      }
    });

    // --- 3. CLEANUP DUPLICATED TASKS ---
    const tasksRef = collection(db, 'tasks');
    const tasksQuery = query(tasksRef, where('hallId', '==', hallId), where('isActive', '==', true));
    const tasksSnap = await getDocs(tasksQuery);

    const tasksList: any[] = [];
    tasksSnap.forEach(snap => {
      tasksList.push({ id: snap.id, ...snap.data() });
    });

    const tasksByTitle: Record<string, any[]> = {};
    tasksList.forEach(task => {
      const title = task.title || '';
      if (!tasksByTitle[title]) tasksByTitle[title] = [];
      tasksByTitle[title].push(task);
    });

    Object.keys(tasksByTitle).forEach(title => {
      const tasksGroup = tasksByTitle[title];
      if (tasksGroup.length > 1) {
        tasksGroup.sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return aTime - bTime;
        });

        const oldestTask = tasksGroup[0];
        console.log(`[runProductionCleanup] Keeping task "${oldestTask.title}" (ID: ${oldestTask.id})`);

        for (let i = 1; i < tasksGroup.length; i++) {
          const dupTask = tasksGroup[i];
          batch.update(doc(db, 'tasks', dupTask.id), {
            isActive: false,
            deletedAt: now,
            archivedAt: now,
            updatedAt: now
          });
          hasChanges = true;
          console.warn(`[runProductionCleanup] Soft-deleting duplicate task "${title}" (ID: ${dupTask.id})`);
        }
      }
    });

    // --- 4. CLEANUP DUPLICATED NOTIFICATIONS ---
    const notificationsRef = collection(db, 'notifications');
    const notificationsQuery = query(notificationsRef, where('hallId', '==', hallId));
    const notificationsSnap = await getDocs(notificationsQuery);

    const notificationsList: any[] = [];
    notificationsSnap.forEach(snap => {
      notificationsList.push({ id: snap.id, ...snap.data() });
    });

    const notificationsByKey: Record<string, any[]> = {};
    notificationsList.forEach(notif => {
      const key = `${notif.title}_${notif.message}`;
      if (!notificationsByKey[key]) notificationsByKey[key] = [];
      notificationsByKey[key].push(notif);
    });

    Object.keys(notificationsByKey).forEach(key => {
      const notifsGroup = notificationsByKey[key];
      if (notifsGroup.length > 1) {
        notifsGroup.sort((a, b) => {
          const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
          const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
          return aTime - bTime;
        });

        // Keep the oldest, delete the rest
        for (let i = 1; i < notifsGroup.length; i++) {
          const dupNotif = notifsGroup[i];
          batch.delete(doc(db, 'notifications', dupNotif.id));
          hasChanges = true;
          console.warn(`[runProductionCleanup] Deleting duplicate notification "${dupNotif.title}" (ID: ${dupNotif.id})`);
        }
      }
    });

    // --- 5. COMMIT CLEANUP ACTIONS ATOMICALLY ---
    if (hasChanges) {
      await batch.commit();
      console.log(`[runProductionCleanup] Cleanup pass successfully executed and committed!`);
    } else {
      console.log(`[runProductionCleanup] No duplicate demo records detected. Workspace is clean.`);
    }

  } catch (error) {
    console.error('[runProductionCleanup] Error during database cleanup pass:', error);
  }
};
