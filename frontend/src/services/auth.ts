export async function register(
  username: string,
  email: string,
  password: string,
) {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
		email,
        password,
      }),
    },
  );

  const data = await response.json();

  return {
    ok: response.ok,
    data,
  };
}

export async function loginResponse(email: string, password: string) {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    },
  );

  const data = await response.json();

  return {
    ok: response.ok,
    data,
  };
}
