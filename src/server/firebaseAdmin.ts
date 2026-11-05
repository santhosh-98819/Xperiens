import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

let projectId = '';
let databaseId = '(default)';

try {
  const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    if (config.projectId) {
      projectId = config.projectId;
    }
    if (config.firestoreDatabaseId) {
      databaseId = config.firestoreDatabaseId;
    }
  }
} catch (e) {
  console.warn('Could not read firebase-applet-config.json:', e);
}

let app: App;
if (!getApps().length) {
  // Explicitly configure projectId from firebase-applet-config.json so ID token "aud" claim matches client project ID
  app = initializeApp(projectId ? { projectId } : {});
} else {
  app = getApps()[0];
}

export const adminAuth = getAuth(app);
// Always use the configured database ID or fallback
export const adminDb = getFirestore(
  app,
  databaseId && databaseId !== '(default)'
    ? databaseId
    : 'ai-studio-commonmind-1be402e9-53c6-4be5-bf36-4a58c66ba872'
);
