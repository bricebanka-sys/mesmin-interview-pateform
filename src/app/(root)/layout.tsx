import StreamClientProvider from "@/components/providers/StreamClientProvider";


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StreamClientProvider>
      <div className="flex flex-col min-h-screen">
        {children}
      </div>
    </StreamClientProvider>
  );
}