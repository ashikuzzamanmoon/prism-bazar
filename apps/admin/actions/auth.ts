interface ILogin {
  email: string;
  password: string;
}

export const loginAuthority = async (data: ILogin) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/admin/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Login failed");
    }

    const result = await response.json();
    if (result?.data.accessToken) {
      const token = result.data.accessToken;
      const expires = new Date();
      expires.setDate(expires.getDate() + 10);

      document.cookie = `pbAdminToken=${token}; expires=${expires.toUTCString()}; path=/; ${
        location.protocol === "https:" ? "secure;" : ""
      } SameSite=Strict`;
    }
    return result;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};
