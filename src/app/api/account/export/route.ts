import { createClient } from "@/lib/supabase/server";

const privateHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "Pragma": "no-cache",
  "X-Content-Type-Options": "nosniff",
};

const profileColumns = "id,display_name,first_name,last_name,username,headline,bio,profession,company,city,province_state,country,skills,languages,linkedin_url,website_url,avatar_url,is_public,open_to_mentoring,looking_for_mentor,mentorship_topics";

function failure(status: number, message: string) {
  return Response.json({ error: message }, { status, headers: privateHeaders });
}

export async function POST(request: Request) {
  // The download is explicitly initiated by this site's account page.
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return failure(403, "Open Settings on Afghan Hub to download your data.");
  }

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return failure(401, "Sign in again to download your data.");
    }

    // Caller-supplied IDs and request bodies cannot change the export owner.
    const { data: profile, error } = await supabase
      .from("profiles")
      .select(profileColumns)
      .eq("id", user.id)
      .abortSignal(AbortSignal.timeout(8000))
      .maybeSingle();

    if (error || (profile && profile.id !== user.id)) {
      return failure(500, "Your download could not be prepared. Please try again.");
    }

    // Construct both sections explicitly; never serialize an Auth user or session object.
    const safeProfile = profile ? Object.fromEntries(
      profileColumns.split(",").map((key) => [key, profile[key as keyof typeof profile]]),
    ) : null;

    return Response.json({
      schema_version: 1,
      generated_at: new Date().toISOString(),
      scope: ["account", "profile"],
      excluded: ["conversations", "messages", "connections", "listings", "saved_opportunities", "event_rsvps", "uploaded_file_contents"],
      account: {
        id: user.id,
        email: user.email ?? null,
        created_at: user.created_at,
      },
      profile: safeProfile,
    }, {
      headers: {
        ...privateHeaders,
        "Content-Disposition": 'attachment; filename="afghan-hub-account-profile.json"',
      },
    });
  } catch {
    return failure(500, "Your download could not be prepared. Please try again.");
  }
}
