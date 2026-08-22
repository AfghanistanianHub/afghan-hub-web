import Link from "next/link";

type Business = {
  id: string;
  name: string;
  slug: string;
  category: string;
  short_description: string | null;
  city: string | null;
  province_state: string | null;
  country: string | null;
  services: string[];
  logo_url: string | null;
  is_verified: boolean;
  is_hiring: boolean;
};

type BusinessDirectoryProps = {
  businesses: Business[];
};

export function BusinessDirectory({
  businesses,
}: BusinessDirectoryProps) {
  if (businesses.length === 0) {
    return (
      <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center">
        <h2 className="text-xl font-semibold">No businesses yet</h2>
        <p className="mt-2 text-slate-400">
          Community businesses will appear here once they are added.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {businesses.map((business) => {
        const location = [
          business.city,
          business.province_state,
          business.country,
        ]
          .filter(Boolean)
          .join(", ");

        return (
          <Link
            key={business.id}
            href={`/businesses/${business.slug}`}
            className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition hover:border-emerald-500/50 hover:bg-slate-900"
          >
            <div className="flex items-start gap-4">
              {business.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={business.logo_url}
                  alt={`${business.name} logo`}
                  className="h-14 w-14 rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-lg font-bold text-emerald-400">
                  {business.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-lg font-semibold">
                    {business.name}
                  </h2>

                  {business.is_verified ? (
                    <span className="text-xs font-medium text-emerald-400">
                      Verified
                    </span>
                  ) : null}

                  {business.is_hiring ? (
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-300">
                      Hiring
                    </span>
                  ) : null}
                </div>

                <p className="mt-1 text-sm text-slate-400">
                  {business.category}
                </p>
              </div>
            </div>

            {business.short_description ? (
              <p className="mt-5 line-clamp-3 leading-6 text-slate-300">
                {business.short_description}
              </p>
            ) : (
              <p className="mt-5 text-sm text-slate-500">
                No description provided.
              </p>
            )}

            {business.services.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {business.services.map((service) => (
                  <span
                    key={service}
                    className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs text-slate-300"
                  >
                    {service}
                  </span>
                ))}
              </div>
            ) : null}

            {location ? (
              <p className="mt-5 text-sm text-slate-400">{location}</p>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}
