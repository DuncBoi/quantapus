import type { Metadata } from "next";
import { UserProvider } from '@/context/UserContext'
import { DataProvider } from '@/context/DataContext'
import { CompletedProvider } from "@/context/CompletedContext";
import NavBar from "../components/NavBar";
import { fetchData } from "@/utils/fetchData";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quantapus",
  description: "Free Quant Finance Roadmap",
  icons: {
    icon: [
      { url: '/logo.svg', type: 'image/svg+xml'}
    ],
  },
};

export default async function RootLayout({children}: Readonly<{children: React.ReactNode;}>) {
  const { user, problemsById, roadmap } = await fetchData()

  return (
    <html lang="en">
      <body className={"text-white antialiased font-mono"}>
        <UserProvider initialUser={user}>
          <CompletedProvider>
          <DataProvider initialProblems={problemsById} initialRoadmap={roadmap}>
            <NavBar/>
            {children}
          </DataProvider>
          </CompletedProvider>
        </UserProvider>
      </body>
    </html>
  );
}
