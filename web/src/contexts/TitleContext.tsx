/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';

interface TitleContextType {
  title: string;
  setTitle: (title: string) => void;
}

const TitleContext = createContext<TitleContextType>({
  title: "Caller's Box",
  setTitle: () => {},
});

export const TitleProvider = ({ children }: { children: React.ReactNode }) => {
  const [title, setTitle] = useState("Caller's Box");

  useEffect(() => {
    document.title = title && title !== "Caller's Box" ? `${title} | Caller's Box` : "Caller's Box";
  }, [title]);

  return (
    <TitleContext.Provider value={{ title, setTitle }}>
      {children}
    </TitleContext.Provider>
  );
};

export const useTitle = () => useContext(TitleContext);
