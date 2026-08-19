import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLoginMutation } from "./use-auth-queries";
import { getApiErrorMessage } from "@/lib/error-utils";

export function useAuthForm() {
  const router = useRouter();
  const loginMutation = useLoginMutation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMsg(null);

    try {
      await loginMutation.mutateAsync({ email, password });
      router.push("/dashboard");
    } catch (err: unknown) {
      setErrorMsg(getApiErrorMessage(err) || "Invalid credentials or backend server unreachable.");
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    isLoading: loginMutation.isPending,
    errorMsg,
    handleSubmit,
  };
}
