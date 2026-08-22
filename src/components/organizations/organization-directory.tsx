import Link from "next/link";

type Organization = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  organization_type: string | null;
  city: string | null;
  province_state: string | null;
  country: string | null;
  logo_url: string | null;
  is_verified: boolean;
};

type OrganizationDirectoryProps = {
  organizations: Organization[];
};

export function OrganizationDirectory({
  organizations,
}: OrganizationDirectoryProps) {
  if (organizations.length === 0) {
    return (
      <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center">
        <h2 className="text-xl font-semibold">No organizations yet</h2>
        <p className="mt-2 text-slate-400">
          Community organizations will appear here once they are added.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {organizations.map((organization) => {
        const location = [
          organization.city,
          organization.province_state,
          organization.country,
        ]
          .filter(Boolean)
          .join(", ");

        return (
          <Link
            key={organization.id}
            href={`/organizations/${organization.slug}`}
            className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition hover:border-emerald-500/50 hover:bg-slate-900"
          >
            <div className="flex items-start gap-4">
              {organization.logo_url ? (
                <img
                  src={organization.logo_url}
                  alt={`${organization.name} logo`}
                  className="h-14 w-14 rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-lg font-bold text-emerald-400">
                  {organization.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-lg font-semibold">
                    {organization.name}
                  </h2>

                  {organization.is_verified ? (
                    <span className="text-xs font-medium text-emerald-400">
                      Verified
                    </span>
                  ) : null}
                </div>

                {organization.organization_type ? (
                  <p className="mt-1 text-sm text-slate-400">
                    {organization.organization_type}
                  </p>
                ) : null}
              </div>
            </div>

            {organization.short_description ? (
              <p className="mt-5 line-clamp-3 leading-6 text-slate-300">
                {organization.short_description}
              </p>
            ) : (
              <p className="mt-5 text-sm text-slate-500">
                No description provided.
              </p>
            )}

            {location ? (
              <p className="mt-5 text-sm text-slate-400">{location}</p>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}
