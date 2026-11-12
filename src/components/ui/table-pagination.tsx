import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { SelectInput, type SelectOptionProps } from "@/components/ui/select-input";
import { cn } from "@/lib/utils";

export interface TablePaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export function TablePagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 25, 50],
  className,
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);

  const startItem = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = Math.min(safePage * pageSize, totalItems);

  // Generate visible page numbers (up to 5 pages around current)
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, safePage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pages = getPageNumbers();

  const options: SelectOptionProps[] = React.useMemo(
    () => pageSizeOptions.map((opt) => ({ value: String(opt), label: String(opt) })),
    [pageSizeOptions],
  );

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-xs text-muted-foreground",
        className,
      )}
    >
      {/* Left side: Rows per page and item count */}
      <div className="flex items-center gap-2">
        <span className="text-xs">Rows per page</span>
        <SelectInput
          datalist={options}
          value={String(pageSize)}
          onChange={(val) => {
            if (val) {
              onPageSizeChange(Number(val));
              onPageChange(1);
            }
          }}
          containerClassName="w-20"
          hideClear
        />
        <span className="ml-2 font-medium text-foreground">
          {startItem}-{endItem} of {totalItems}
        </span>
      </div>

      {/* Right side: Pagination buttons */}
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-7 w-7 text-xs"
          disabled={safePage <= 1}
          onClick={() => onPageChange(1)}
          title="First page"
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-7 w-7 text-xs"
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
          title="Previous page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>

        {pages.map((p) => {
          const isActive = p === safePage;
          return (
            <Button
              key={p}
              type="button"
              variant={isActive ? "default" : "outline"}
              className={cn(
                "h-7 min-w-7 px-2 text-xs font-medium",
                isActive
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm border-blue-600"
                  : "bg-background text-foreground hover:bg-muted",
              )}
              onClick={() => onPageChange(p)}
            >
              {p}
            </Button>
          );
        })}

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-7 w-7 text-xs"
          disabled={safePage >= totalPages}
          onClick={() => onPageChange(safePage + 1)}
          title="Next page"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-7 w-7 text-xs"
          disabled={safePage >= totalPages}
          onClick={() => onPageChange(totalPages)}
          title="Last page"
        >
          <ChevronsRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

