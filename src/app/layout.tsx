import type { Metadata } from "next";
import { UserProvider } from '@/context/UserContext'
import { DataProvider } from '@/context/DataContext'
import { CompletedProvider } from "@/context/CompletedContext";
import NavBar from "../components/NavBar";
import { fetchData } from "@/utils/fetchData";
import { Roboto_Flex } from 'next/font/google'
import "./globals.css";

const roboto = Roboto_Flex({
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
})

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
  const { user, problemsById, roadmap, completedSet } = await fetchData()

  return (
    <html lang="en" className={roboto.variable}>
      <body>
        <UserProvider initialUser={user}>
          <CompletedProvider initialCompleted={completedSet}>
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
