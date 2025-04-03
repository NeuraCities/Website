export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
<div className="h-screen w-full overflow-hidden relative flex flex-col">
<div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}