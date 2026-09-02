import { NextRequest, NextResponse } from "next/server";
import { getFirebaseFirestore } from "@/lib/firebase/admin";
import { Query, Transaction } from "firebase-admin/firestore";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;
    const db = getFirebaseFirestore();

    switch (action) {
      case "getDoc": {
        const { collection, docId } = params;
        if (!collection || !docId) return NextResponse.json({ error: "collection and docId required" }, { status: 400 });
        const doc = await db.collection(collection).doc(docId).get();
        return NextResponse.json({ exists: doc.exists, data: doc.data(), id: doc.id });
      }

      case "setDoc": {
        const { collection, docId, data, merge = false } = params;
        if (!collection || !docId || !data) return NextResponse.json({ error: "collection, docId, data required" }, { status: 400 });
        await db.collection(collection).doc(docId).set(data, { merge });
        return NextResponse.json({ success: true, id: docId });
      }

      case "updateDoc": {
        const { collection, docId, data } = params;
        if (!collection || !docId || !data) return NextResponse.json({ error: "collection, docId, data required" }, { status: 400 });
        await db.collection(collection).doc(docId).update(data);
        return NextResponse.json({ success: true, id: docId });
      }

      case "deleteDoc": {
        const { collection, docId } = params;
        if (!collection || !docId) return NextResponse.json({ error: "collection and docId required" }, { status: 400 });
        await db.collection(collection).doc(docId).delete();
        return NextResponse.json({ success: true });
      }

      case "query": {
        const { collection, where, orderBy, limit = 50, startAfter } = params;
        if (!collection) return NextResponse.json({ error: "collection required" }, { status: 400 });
        let query: Query = db.collection(collection);
        if (where && Array.isArray(where)) {
          for (const [field, op, value] of where) {
            query = query.where(field, op, value);
          }
        }
        if (orderBy) {
          const [field, direction = "asc"] = orderBy;
          query = query.orderBy(field, direction);
        }
        if (limit) query = query.limit(limit);
        if (startAfter) query = query.startAfter(startAfter);
        const snapshot = await query.get();
        return NextResponse.json({
          docs: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        });
      }

      case "batchWrite": {
        const { writes } = params;
        if (!writes || !Array.isArray(writes)) return NextResponse.json({ error: "writes array required" }, { status: 400 });
        const batch = db.batch();
        for (const w of writes) {
          const ref = db.collection(w.collection).doc(w.docId);
          if (w.operation === "set") batch.set(ref, w.data, { merge: w.merge ?? false });
          else if (w.operation === "update") batch.update(ref, w.data);
          else if (w.operation === "delete") batch.delete(ref);
        }
        await batch.commit();
        return NextResponse.json({ success: true, count: writes.length });
      }

      case "runTransaction": {
        const { operations } = params;
        if (!operations || !Array.isArray(operations)) return NextResponse.json({ error: "operations array required" }, { status: 400 });
        const result = await db.runTransaction(async (transaction: Transaction) => {
          const results = [];
          for (const op of operations) {
            const ref = db.collection(op.collection).doc(op.docId);
            if (op.operation === "get") {
              const doc = await transaction.get(ref);
              results.push({ exists: doc.exists, data: doc.data() });
            } else if (op.operation === "set") {
              transaction.set(ref, op.data, { merge: op.merge ?? false });
            } else if (op.operation === "update") {
              transaction.update(ref, op.data);
            } else if (op.operation === "delete") {
              transaction.delete(ref);
            }
          }
          return results;
        });
        return NextResponse.json({ results: result });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Firestore error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}