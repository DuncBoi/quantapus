import type { Metadata } from "next";
import { UserProvider } from '@/context/UserContext'
import { DataProvider } from '@/context/DataContext'
import { CompletedProvider } from "@/context/CompletedContext";
import NavBar from "../components/nav/NavBar";
import { fetchData } from "@/utils/fetchData";
import { Roboto_Flex } from 'next/font/google'
import { Toaster } from "../components/ui/sonner";
import { AnalyticsPageView } from "@/components/nav/AnalyticsPageView";
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from "@vercel/analytics/next"
import "./globals.css";
import Script from "next/script";

const roboto = Roboto_Flex({
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Quantapus",
  description: "Free Quant Finance Interview Roadmap",
  icons: {
    icon: [
      { url: '/logo.svg', type: 'image/svg+xml' }
    ],
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  const { user, problemsById, roadmap, completedSet, categories, problemCategories, streakInfo } = await fetchData()

  return (
    <html lang="en" className={roboto.variable}>
      <head>
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r121/three.min.js" strategy="beforeInteractive" />
        <Script src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.net.min.js" strategy="beforeInteractive" />
        {/* --- Google Analytics --- */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-8RD1SC826C"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', 'G-8RD1SC826C', { 'send_page_view': false });
          `}
        </Script>

        {/* --- Microsoft Clarity --- */}
        <Script id="clarity-init" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "r43p2wr72d");
          `}
        </Script>
      </head>
      <body>
        <UserProvider initialUser={user}>
          <CompletedProvider initialCompleted={completedSet} initialStreakInfo={streakInfo}>
            <DataProvider
              initialProblems={problemsById}
              initialRoadmap={roadmap}
              initialCategories={categories}
              initialProblemCategories={problemCategories}
            >            
            <NavBar />
            <AnalyticsPageView />
              {children}
               <Toaster />
               <SpeedInsights/>
               <Analytics/>
            </DataProvider>
          </CompletedProvider>
        </UserProvider>
      </body>
    </html>
  );
}
