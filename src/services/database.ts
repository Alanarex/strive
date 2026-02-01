/**
 * Service de persistance locale avec SQLite
 */

import * as SQLite from 'expo-sqlite';
import type { User, Activity, GPSPoint } from '../types';

const DB_NAME = 'strive.db';

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase(): Promise<void> {
  if (db) return;
  db = await SQLite.openDatabaseAsync(DB_NAME);

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      photo TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      distance REAL NOT NULL,
      duration INTEGER NOT NULL,
      average_speed REAL NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      gps_points TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);
}

export async function createUser(
  id: string,
  name: string,
  email: string,
  passwordHash: string,
  photo?: string
): Promise<void> {
  await initDatabase();
  if (!db) throw new Error('Database not initialized');
  await db.runAsync(
    `INSERT INTO users (id, name, email, password_hash, photo, created_at)
     VALUES (?, ?, ?, ?, ?, datetime('now'))`,
    [id, name, email, passwordHash, photo ?? null]
  );
}

export async function getUserByEmail(email: string): Promise<User | null> {
  await initDatabase();
  if (!db) throw new Error('Database not initialized');
  const row = await db.getFirstAsync<{
    id: string;
    name: string;
    email: string;
    password_hash: string;
    photo: string | null;
    created_at: string;
  }>(
    `SELECT * FROM users WHERE LOWER(email) = LOWER(?)`,
    [email.trim()]
  );
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    photo: row.photo ?? undefined,
    createdAt: row.created_at,
  };
}

export async function getUserById(id: string): Promise<User | null> {
  await initDatabase();
  if (!db) throw new Error('Database not initialized');
  const row = await db.getFirstAsync<{
    id: string;
    name: string;
    email: string;
    password_hash: string;
    photo: string | null;
    created_at: string;
  }>(`SELECT * FROM users WHERE id = ?`, [id]);
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    photo: row.photo ?? undefined,
    createdAt: row.created_at,
  };
}

export async function updateUser(
  id: string,
  updates: { name?: string; email?: string; photo?: string }
): Promise<void> {
  await initDatabase();
  if (!db) throw new Error('Database not initialized');
  const user = await getUserById(id);
  if (!user) return;
  const name = updates.name ?? user.name;
  const email = updates.email ?? user.email;
  const photo = updates.photo !== undefined ? updates.photo : user.photo;
  await db.runAsync(
    `UPDATE users SET name = ?, email = ?, photo = ? WHERE id = ?`,
    [name, email, photo ?? null, id]
  );
}

export async function saveActivity(activity: Activity): Promise<void> {
  await initDatabase();
  if (!db) throw new Error('Database not initialized');
  const gpsJson = JSON.stringify(activity.gpsPoints);
  await db.runAsync(
    `INSERT INTO activities (id, user_id, type, distance, duration, average_speed, start_time, end_time, gps_points)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      activity.id,
      activity.userId,
      activity.type,
      activity.distance,
      activity.duration,
      activity.averageSpeed,
      activity.startTime,
      activity.endTime,
      gpsJson,
    ]
  );
}

export async function getActivitiesByUserId(userId: string): Promise<Activity[]> {
  await initDatabase();
  if (!db) throw new Error('Database not initialized');
  const rows = await db.getAllAsync<{
    id: string;
    user_id: string;
    type: string;
    distance: number;
    duration: number;
    average_speed: number;
    start_time: string;
    end_time: string;
    gps_points: string;
  }>(`SELECT * FROM activities WHERE user_id = ? ORDER BY start_time DESC`, [
    userId,
  ]);
  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    type: row.type as Activity['type'],
    distance: row.distance,
    duration: row.duration,
    averageSpeed: row.average_speed,
    startTime: row.start_time,
    endTime: row.end_time,
    gpsPoints: JSON.parse(row.gps_points) as GPSPoint[],
    recordingState: 'completed' as const,
  }));
}

export async function getActivityById(
  id: string,
  userId: string
): Promise<Activity | null> {
  await initDatabase();
  if (!db) throw new Error('Database not initialized');
  const row = await db.getFirstAsync<{
    id: string;
    user_id: string;
    type: string;
    distance: number;
    duration: number;
    average_speed: number;
    start_time: string;
    end_time: string;
    gps_points: string;
  }>(`SELECT * FROM activities WHERE id = ? AND user_id = ?`, [id, userId]);
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type as Activity['type'],
    distance: row.distance,
    duration: row.duration,
    averageSpeed: row.average_speed,
    startTime: row.start_time,
    endTime: row.end_time,
    gpsPoints: JSON.parse(row.gps_points) as GPSPoint[],
    recordingState: 'completed' as const,
  };
}

export async function deleteActivity(id: string, userId: string): Promise<void> {
  await initDatabase();
  if (!db) throw new Error('Database not initialized');
  await db.runAsync(`DELETE FROM activities WHERE id = ? AND user_id = ?`, [id, userId]);
}
