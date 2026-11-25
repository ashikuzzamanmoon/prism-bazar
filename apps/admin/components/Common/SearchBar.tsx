/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

const SearchBar = ({
  searchInput,
  setSearchInput,
  searchTerm,
  clearSearch,
}: {
  searchInput: string;
  setSearchInput: (e: any) => void;
  searchTerm: string;
  clearSearch: () => void;
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Input
        type="text"
        placeholder="Search..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className="h-10 shadow-none"
      />
      <Button
        type="submit"
        size="sm"
        className="h-10 cursor-pointer bg-primary text-white hover:bg-primary dark:bg-[#ff7200]"
      >
        <Search className="h-4 w-4 mr-1" />
      </Button>
      {searchTerm && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={clearSearch}
          className="h-9 px-2 cursor-pointer bg-red-100 text-red-500"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default SearchBar;