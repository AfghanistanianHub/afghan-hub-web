import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const SECONDARY_HOST = "rurgmyiiytesknsfwjjl.supabase.co";
const WRITE_ACK = "I_UNDERSTAND_THIS_TOUCHES_ONLY_DISPOSABLE_SECONDARY_PERSONAS";
const PNG_1X1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

for (const name of [
  "AUTH_ACCEPTANCE_SUPABASE_URL",
  "AUTH_ACCEPTANCE_PUBLISHABLE_KEY",
  "AUTH_ACCEPTANCE_MEMBER_A_EMAIL",
  "AUTH_ACCEPTANCE_MEMBER_A_PASSWORD",
  "AUTH_ACCEPTANCE_MEMBER_B_EMAIL",
  "AUTH_ACCEPTANCE_MEMBER_B_PASSWORD",
]) {
  assert.ok(process.env[name]?.trim(), `Missing required environment variable: ${name}`);
}

const mode = process.env.AVATAR_ACCEPTANCE_MODE?.trim() || "plan";
assert.ok(["plan", "write"].includes(mode), "AVATAR_ACCEPTANCE_MODE must be plan or write");

const supabaseUrl = process.env.AUTH_ACCEPTANCE_SUPABASE_URL.trim().replace(/\/+$/, "");
const publishableKey = process.env.AUTH_ACCEPTANCE_PUBLISHABLE_KEY.trim();
const target = new URL(supabaseUrl);
assert.equal(target.protocol, "https:", "Avatar acceptance requires an HTTPS Supabase URL");
assert.equal(
  target.hostname,
  SECONDARY_HOST,
  "Avatar Storage acceptance is hard-pinned to the designated secondary project",
);

if (mode === "write") {
  assert.equal(
    process.env.AVATAR_ACCEPTANCE_ALLOW_WRITES,
    WRITE_ACK,
    "Refusing avatar writes without the disposable-secondary acknowledgement",
  );
}

const configured = [
  {
    label: "Member A",
    email: process.env.AUTH_ACCEPTANCE_MEMBER_A_EMAIL.trim(),
    password: process.env.AUTH_ACCEPTANCE_MEMBER_A_PASSWORD,
  },
  {
    label: "Member B",
    email: process.env.AUTH_ACCEPTANCE_MEMBER_B_EMAIL.trim(),
    password: process.env.AUTH_ACCEPTANCE_MEMBER_B_PASSWORD,
  },
];
assert.notEqual(
  configured[0].email.toLowerCase(),
  configured[1].email.toLowerCase(),
  "Member A and Member B must be distinct disposable accounts",
);

function client() {
  return createClient(supabaseUrl, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

async function signIn(persona) {
  const supabase = client();
  const result = await supabase.auth.signInWithPassword({
    email: persona.email,
    password: persona.password,
  });
  assert.ifError(result.error);
  assert.ok(result.data.user?.id, `${persona.label} sign-in returned no user id`);
  assert.ok(result.data.user?.email_confirmed_at, `${persona.label} is not email-confirmed`);

  const access = await supabase.rpc("get_my_access_context");
  assert.ifError(access.error);
  const state = access.data?.[0] ?? null;
  assert.ok(state, `${persona.label} access context is missing`);
  assert.equal(state.role, "member", `${persona.label} must be an ordinary member persona`);
  assert.equal(state.onboarding_completed, true, `${persona.label} has not completed onboarding`);

  return { ...persona, supabase, userId: result.data.user.id };
}

async function signOut(persona) {
  if (!persona?.supabase) return;
  const result = await persona.supabase.auth.signOut({ scope: "local" });
  assert.ifError(result.error);
}

async function publicRead(publicUrl) {
  return fetch(`${publicUrl}?acceptance=${Date.now()}`, {
    cache: "no-store",
    redirect: "follow",
  });
}

let a;
let b;
let filePath;
let crossPath;
let originalAvatarUrl;
let profileChanged = false;

try {
  a = await signIn(configured[0]);
  b = await signIn(configured[1]);
  console.log("PASS designated Member A/B accounts authenticate as confirmed onboarded members");

  const profile = await a.supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", a.userId)
    .single();
  assert.ifError(profile.error);
  originalAvatarUrl = profile.data.avatar_url ?? null;

  if (mode === "plan") {
    console.log(`Target: https://${SECONDARY_HOST}`);
    console.log("Plan mode passed. No Storage object or profile row was written.");
    console.log("Write mode uses a generated 1x1 PNG fixture; no real user photo is used.");
  } else {
    const marker = `acceptance-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    filePath = `${a.userId}/${marker}.png`;
    crossPath = `${a.userId}/${marker}-cross-user.png`;

    const upload = await a.supabase.storage.from("avatars").upload(filePath, PNG_1X1, {
      cacheControl: "60",
      contentType: "image/png",
      upsert: false,
    });
    assert.ifError(upload.error);
    console.log("PASS Member A own-folder avatar upload");

    const publicUrl = a.supabase.storage.from("avatars").getPublicUrl(filePath).data.publicUrl;
    assert.ok(publicUrl, "Avatar public URL was not generated");
    const initialRead = await publicRead(publicUrl);
    assert.equal(initialRead.ok, true, `Public avatar read failed with HTTP ${initialRead.status}`);
    console.log("PASS anonymous/public avatar read");

    const crossUpload = await b.supabase.storage.from("avatars").upload(crossPath, PNG_1X1, {
      cacheControl: "60",
      contentType: "image/png",
      upsert: false,
    });
    assert.ok(crossUpload.error, "Member B unexpectedly wrote into Member A's avatar folder");
    console.log("PASS cross-user avatar upload denied");

    await b.supabase.storage.from("avatars").remove([filePath]);
    const afterCrossDelete = await publicRead(publicUrl);
    assert.equal(
      afterCrossDelete.ok,
      true,
      "Member B removed Member A's avatar object or made it unreadable",
    );
    console.log("PASS cross-user avatar delete denied");

    const update = await a.supabase.storage.from("avatars").update(filePath, PNG_1X1, {
      cacheControl: "60",
      contentType: "image/png",
    });
    assert.ifError(update.error);
    console.log("PASS Member A own-folder avatar update");

    const profileUpdate = await a.supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", a.userId)
      .select("avatar_url")
      .single();
    assert.ifError(profileUpdate.error);
    assert.equal(profileUpdate.data.avatar_url, publicUrl);
    profileChanged = true;
    console.log("PASS Member A profile avatar_url update");

    const removal = await a.supabase.storage.from("avatars").remove([filePath]);
    assert.ifError(removal.error);

    const listed = await a.supabase.storage.from("avatars").list(a.userId, {
      limit: 100,
      search: `${marker}.png`,
    });
    assert.ifError(listed.error);
    assert.equal(
      (listed.data ?? []).some((item) => item.name === `${marker}.png`),
      false,
      "Member A avatar object still exists after own-folder delete",
    );
    filePath = undefined;
    console.log("PASS Member A own-folder avatar delete");
  }
} finally {
  if (a?.supabase) {
    if (filePath || crossPath) {
      const cleanupPaths = [filePath, crossPath].filter(Boolean);
      if (cleanupPaths.length > 0) {
        const cleanup = await a.supabase.storage.from("avatars").remove(cleanupPaths);
        if (cleanup.error) {
          console.error(`Cleanup warning: ${cleanup.error.message}`);
        }
      }
    }

    if (profileChanged) {
      const restore = await a.supabase
        .from("profiles")
        .update({ avatar_url: originalAvatarUrl })
        .eq("id", a.userId);
      if (restore.error) {
        console.error(`Profile cleanup warning: ${restore.error.message}`);
      } else {
        console.log("PASS profile avatar_url restored after acceptance fixture");
      }
    }
  }

  await signOut(a);
  await signOut(b);
}
