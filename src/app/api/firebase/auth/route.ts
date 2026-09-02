import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAuth } from "@/lib/firebase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;
    const auth = getFirebaseAuth();

    switch (action) {
      case "verifyToken": {
        const { idToken } = params;
        if (!idToken) return NextResponse.json({ error: "idToken required" }, { status: 400 });
        const decoded = await auth.verifyIdToken(idToken);
        return NextResponse.json({ uid: decoded.uid, email: decoded.email, claims: decoded });
      }

      case "createUser": {
        const { email, password, displayName, emailVerified } = params;
        if (!email || !password) return NextResponse.json({ error: "email and password required" }, { status: 400 });
        const userRecord = await auth.createUser({ email, password, displayName, emailVerified: emailVerified ?? false });
        return NextResponse.json({ uid: userRecord.uid, email: userRecord.email });
      }

      case "getUser": {
        const { uid } = params;
        if (!uid) return NextResponse.json({ error: "uid required" }, { status: 400 });
        const userRecord = await auth.getUser(uid);
        return NextResponse.json({ uid: userRecord.uid, email: userRecord.email, displayName: userRecord.displayName, emailVerified: userRecord.emailVerified, createdAt: userRecord.metadata.creationTime });
      }

      case "updateUser": {
        const { uid, ...updates } = params;
        if (!uid) return NextResponse.json({ error: "uid required" }, { status: 400 });
        const userRecord = await auth.updateUser(uid, updates);
        return NextResponse.json({ uid: userRecord.uid, email: userRecord.email });
      }

      case "deleteUser": {
        const { uid } = params;
        if (!uid) return NextResponse.json({ error: "uid required" }, { status: 400 });
        await auth.deleteUser(uid);
        return NextResponse.json({ success: true });
      }

      case "setCustomClaims": {
        const { uid, claims } = params;
        if (!uid || !claims) return NextResponse.json({ error: "uid and claims required" }, { status: 400 });
        await auth.setCustomUserClaims(uid, claims);
        return NextResponse.json({ success: true });
      }

      case "listUsers": {
        const { maxResults = 1000, pageToken } = params;
        const listUsersResult = await auth.listUsers(maxResults, pageToken);
        return NextResponse.json({
          users: listUsersResult.users.map((u: any) => ({ uid: u.uid, email: u.email, displayName: u.displayName, emailVerified: u.emailVerified, createdAt: u.metadata.creationTime })),
          pageToken: listUsersResult.pageToken,
        });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Firebase Auth error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}