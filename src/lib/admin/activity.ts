import dbConnect from "@/lib/db/mongoose";
import ActivityLogModel from "@/lib/db/models/ActivityLog";

interface LogEntry {
  action:      string;
  entityType:  string;
  entityId?:   string;
  entityTitle?: string;
  details?:    string;
}

export function logActivity(entry: LogEntry): void {
  // Fire-and-forget — never throws, never blocks the response
  (async () => {
    try {
      await dbConnect();
      await ActivityLogModel.create(entry);
    } catch {
      // Logging failure must never affect the main operation
    }
  })();
}
