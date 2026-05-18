/**
 * axiosInstance.ts
 *
 * Client-side axios instance.
 * - ใช้ใน Client Components ("use client") และ custom hooks
 * - token เป็น httpOnly cookie → browser ส่งให้อัตโนมัติผ่าน withCredentials
 * - เมื่อได้รับ 401 จะ redirect ไป /signin อัตโนมัติ
 */

import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true, // ส่ง httpOnly cookie ไปด้วยทุก request
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Response Interceptor ────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token หมดอายุหรือไม่ถูกต้อง → ออกไปหน้า login
      if (typeof window !== "undefined") {
        window.location.href = "/signin";
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
