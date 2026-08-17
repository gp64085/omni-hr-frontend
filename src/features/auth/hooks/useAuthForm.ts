import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/use-auth-store";
import { authApi } from "@/features/auth/api/auth-api";

export function useAuthForm() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const loginApiResponse = await authApi.login({ email, password });
      const { access_token, refresh_token } = loginApiResponse.data;
      const userProfileResponse = await authApi.getMe(access_token);
      setAuth(userProfileResponse.data, access_token, refresh_token);
      router.push("/dashboard");
    } catch (authenticationError: unknown) {
      console.error(authenticationError);
      const err = authenticationError as { response?: { data?: { error?: { message?: string } } } };
      setErrorMsg(
        err.response?.data?.error?.message || "Invalid credentials or backend server unreachable."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    errorMsg,
    handleSubmit,
  };
}
