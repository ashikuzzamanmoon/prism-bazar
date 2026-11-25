import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

function buildHref(pathname: string, params: URLSearchParams, page: number) {
  const nextParams = new URLSearchParams(params.toString());

  if (page <= 1) {
    nextParams.delete("page");
  } else {
    nextParams.set("page", String(page));
  }

  const query = nextParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export default function PaginationControls({
  pathname,
  params,
  page,
  hasNextPage,
}: {
  pathname: string;
  params: URLSearchParams;
  page: number;
  hasNextPage: boolean;
}) {
  return (
    <div className="mt-8 flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3">
      {page > 1 ? (
        <Link
          href={buildHref(pathname, params, page - 1)}
          className="inline-flex items-center rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-orange-500 hover:text-orange-500"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Link>
      ) : (
        <span className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-300">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </span>
      )}

      <p className="text-sm font-semibold text-gray-600">Page {page}</p>

      {hasNextPage ? (
        <Link
          href={buildHref(pathname, params, page + 1)}
          className="inline-flex items-center rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-orange-500 hover:text-orange-500"
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Link>
      ) : (
        <span className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-300">
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </span>
      )}
    </div>
  );
}
