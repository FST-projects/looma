import { Suspense } from "react";

export const metadata = {
  title: "Looma - Login",
  description: "Login to access your Looma account",
  icons: {
    icon: "/looma-icon.png",
  }
};

export default function LoginLayout({ children }) {
   return (
      <Suspense fallback={<div>Loading...</div>}>
        {children}
      </Suspense>
    );
}