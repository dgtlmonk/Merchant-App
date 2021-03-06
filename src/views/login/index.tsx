import { useState } from "react";
import { client } from "../../helpers/api-client";
import { setToken } from "../../helpers/auth";
import LoginForm from "./form";

const host = import.meta.env.VITE_API_HOST;

type Props = {
  onSuccess: () => void;
  settings?: any;
};

export default ({ onSuccess, settings }: Props) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isLoginFailed, setIsLoginFailed] = useState(false);

  function handleLogin(username: string, password: string) {
    setIsAuthenticating(true);
    setIsLoginFailed(false);

    client
      .post(`${host}/login?tenant_code=${settings.business?.tenantCode}`, {
        body: JSON.stringify({
          username,
          password,
        }),
      })

      .then((res) => {
        if (res.error) {
          setIsLoginFailed(true);
          return;
        }

        if (res.token) {
          setToken(res.token);
        }
        setTimeout(() => onSuccess(), 500);
      })
      .catch(() => {
        // TODO: set appropriate error message
        setIsLoginFailed(true);
      })
      .finally(() => {
        setIsAuthenticating(false);
      });
  }

  return (
    <LoginForm
      isAuthenticating={isAuthenticating}
      isLoginFailed={isLoginFailed}
      locationName={settings?.location?.name}
      onLogin={handleLogin}
    />
  );
};
