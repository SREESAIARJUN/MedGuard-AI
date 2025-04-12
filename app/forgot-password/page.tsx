import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-center mb-8">
          MedGuard<span className="text-primary">AI</span>
        </h1>
        <ForgotPasswordForm />
      </div>
    </div>
  )
}
