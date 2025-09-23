import { Suspense } from "react";

export const metadata = {
  title: "Looma - SignUp",
  description: "Signup to create account in Looma",
  icons: {
    icon: "/looma-icon.png",
  },
};

export default function LoginLayout({ children }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      {children}
    </Suspense>
  );
}