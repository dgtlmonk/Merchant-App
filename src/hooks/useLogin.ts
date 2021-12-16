import { useState } from "react";
import { client } from "../helpers/api-client";

const host =
  "http://d4b2-2404-3c00-482e-99c0-5d39-e26c-8a0a-2dbd.ngrok.io/api/users/login";

const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState({});

  async function asyncLogin(email: string, password: string) {
    setIsLoading(true);

    const res = await client.post(host, {
      body: JSON.stringify({
        email,
        password,
      }),
    });

    setData(res);
    setIsLoading(false);
  }

  return {
    isLoading,
    data,
    asyncLogin,
  };
};

export default useLogin;
