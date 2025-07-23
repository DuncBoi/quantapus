import type { Metadata } from "next";
import { UserProvider } from '@/context/UserContext'
import { DataProvider } from '@/context/DataContext'
import { CompletedProvider } from "@/context/CompletedContext";
import NavBar from "../components/nav/NavBar";
import { fetchData } from "@/utils/fetchData";
import { Roboto_Flex } from 'next/font/google'
import { Toaster } from "../components/ui/sonner";
import "./globals.css";
import Script from "next/script";

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
      { url: '/logo.svg', type: 'image/svg+xml' }
    ],
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  const { user, problemsById, roadmap, completedSet, categories, problemCategories } = await fetchData()

  return (
    <html lang="en" className={roboto.variable}>
      <head>
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r121/three.min.js" strategy="beforeInteractive" />
        <Script src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.net.min.js" strategy="beforeInteractive" />
      </head>
      <body>
        <UserProvider initialUser={user}>
          <CompletedProvider initialCompleted={completedSet}>
            <DataProvider
              initialProblems={problemsById}
              initialRoadmap={roadmap}
              initialCategories={categories}
              initialProblemCategories={problemCategories}
            >            
            <NavBar />
              {children}
               <Toaster />
            </DataProvider>
          </CompletedProvider>
        </UserProvider>
      </body>
    </html>
  );
}
