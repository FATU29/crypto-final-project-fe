import { RegisterForm } from "@/components/pages/register";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <RegisterForm />
    </div>
  );
}
