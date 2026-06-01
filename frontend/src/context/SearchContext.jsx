import { createContext, useContext, useState } from "react";

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [searchFilters, setSearchFilters] = useState({
    location: "",
    category: "",
    km: 5,
  });

  return (
    <SearchContext.Provider value={{ searchFilters, setSearchFilters }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => useContext(SearchContext);
