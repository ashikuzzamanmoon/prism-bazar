"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
    sub: string;
    phoneNumber: string;
    roles: string[];
    iat?: number;
    exp?: number;
}

export function useAuth() {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<{ id: string | null; phoneNumber: string | null; roles: string[] }>({
        id: null,
        phoneNumber: null,
        roles: [],
    });

    useEffect(() => {
        const initializeAuth = async () => {
            const storedToken = Cookies.get("pbToken");
            console.log("token get", storedToken);
            if (storedToken) {
                try {
                    const decoded: DecodedToken = jwtDecode(storedToken);
                    console.log("decoded checking", decoded);

                    setToken(storedToken);
                    setUser({
                        id: decoded.sub || null,
                        phoneNumber: decoded.phoneNumber || null,
                        roles: decoded.roles || [],
                    });
                } catch (error) {
                    console.error("Invalid token:", error);
                    setToken(null);
                    setUser({ id: null, phoneNumber: null, roles: [] });
                }
            }
        };

        initializeAuth();
    }, []);

    return { token, setToken, user };
}