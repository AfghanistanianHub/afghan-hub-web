import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function mount(currentUserId) {
  const source = fs.readFileSync(
    path.join(__dirname, "../src/components/messages/realtime-message-refresh.tsx"),
    "utf8",
  );
  const listeners = [];
  let refreshes = 0;
  let cleanup;
  let onStatus;
  let removed = false;
  const channel = {
    on(type, filter, callback) {
      listeners.push({ type, filter, callback });
      return this;
    },
    subscribe(callback) {
      onStatus = callback;
      return this;
    },
  };
  const client = {
    channel: () => channel,
    removeChannel: async (value) => {
      assert.equal(value, channel);
      removed = true;
    },
  };
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    }).outputText,
    {
      exports,
      require(name) {
        if (name === "react") return { useEffect: (effect) => { cleanup = effect(); } };
        if (name === "next/navigation") return { useRouter: () => ({ refresh: () => { refreshes++; } }) };
        if (name === "@/lib/supabase/client") return { createClient: () => client };
        throw new Error("Unexpected dependency: " + name);
      },
    },
  );
  exports.RealtimeMessageRefresh({ currentUserId });
  return {
    emit(table, event, row) {
      if (removed) return;
      for (const { filter, callback } of listeners) {
        if (filter.table !== table || filter.event !== event) continue;
        if (filter.filter) {
          const [column, value] = filter.filter.split("=eq.");
          if (row[column] !== value) continue;
        }
        callback({ new: row });
      }
    },
    status: (value) => onStatus?.(value),
    system(payload) { if (!removed) for (const listener of listeners) if (listener.type === "system") listener.callback(payload); },
    refreshes: () => refreshes,
    cleanup: () => cleanup(),
    removed: () => removed,
  };
}

test("reading in another tab refreshes unread state without a notification event", () => {
  const app = mount("member-a");
  app.emit("conversation_members", "UPDATE", { profile_id: "member-a" });
  assert.equal(app.refreshes(), 1);
  app.emit("conversation_members", "UPDATE", { profile_id: "member-b" });
  assert.equal(app.refreshes(), 1);
});

test("new messages and successful reconnects refresh server data", () => {
  const app = mount("member-a");
  app.emit("messages", "INSERT", {});
  assert.equal(app.refreshes(), 1);
  app.status("SUBSCRIBED");
  assert.equal(app.refreshes(), 1, "socket join does not mean PostgreSQL is ready");
  app.system({extension:"broadcast",status:"ok"});
  app.system({extension:"postgres_changes",status:"error"});
  assert.equal(app.refreshes(), 1);
  app.system({extension:"postgres_changes",status:"ok"});
  app.status("CHANNEL_ERROR");
  app.status("SUBSCRIBED");
  app.system({extension:"postgres_changes",status:"ok"});
  assert.equal(app.refreshes(), 3);
});

test("unmount removes the channel and its event delivery", () => {
  const app = mount("member-a");
  app.cleanup();
  assert.equal(app.removed(), true);
  app.emit("conversation_members", "UPDATE", { profile_id: "member-a" });
  assert.equal(app.refreshes(), 0);
});
