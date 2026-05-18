/**
 * axiosServer.ts
 *
 * Server-side axios instance.
 * - ใช้ใน Server Components, Route Handlers, Server Actions
 * - อ่าน token จาก httpOnly cookie โดยตรงผ่าน next/headers
 * - ต้อง await ก่อนเรียกใช้งาน: const api = await createServerApiClient()
 */

import axios from "axios";
import { cookies } from "next/headers";

export async function createServerApiClient() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  return instance;
}
