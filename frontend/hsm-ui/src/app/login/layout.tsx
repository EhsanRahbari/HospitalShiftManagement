export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="ml-4 mr-5">
        {children}
    </div>
  );
}