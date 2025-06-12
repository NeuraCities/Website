"use client";

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-[100dvh] w-full overflow-hidden relative flex flex-col">
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
      <style jsx global>{`
        /* Fix for iOS height issues */
        @supports (-webkit-touch-callout: none) {
          .h-screen, .h-\\[100dvh\\] {
            height: -webkit-fill-available;
          }
        }
        
        /* Prevent input zoom */
        input, select, textarea {
          font-size: 16px;
        }
        
        /* Ensure touch targets are large enough */
        @media (max-width: 768px) {
          button, .button-option {
            min-height: 44px;
            min-width: 44px;
          }
        }
      `}</style>
    </div>
  );
}