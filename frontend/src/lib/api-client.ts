"use client";

/**
 * Semua request di sini dipanggil dari browser ke path relatif `/api/...`.
 * next.config.ts men-rewrite path itu ke backend Flask (localhost:5000),
 * jadi dari sudut pandang browser cuma ada SATU origin: localhost:3000.
 */

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(path, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await res.json() : null;

  if (!res.ok) {
    const message =
      (body && (body.error || body.message)) || `Request gagal (${res.status})`;
    throw new Error(message);
  }

  return body as T;
}

// ---------- Auth ----------
export function login(username: string, password: string) {
  return request<{ message: string; username: string }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function logout() {
  return request<{ message: string }>("/api/auth/logout", { method: "POST" });
}

export function getMe() {
  return request<{ username: string }>("/api/auth/me");
}

export function updateCredentials(payload: {
  currentPassword: string;
  newUsername?: string;
  newPassword?: string;
}) {
  return request<{ message: string; username: string }>(
    "/api/auth/credentials",
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
}

// ---------- Projects ----------
export function fetchProjects() {
  return request<any[]>("/api/projects");
}

export function fetchProject(id: string) {
  return request<any>(`/api/projects/${id}`);
}

export function createProject(payload: any) {
  return request<{ message: string; id: string }>("/api/projects", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateProject(id: string, payload: any) {
  return request<{ message: string }>(`/api/projects/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteProject(id: string) {
  return request<{ message: string }>(`/api/projects/${id}`, {
    method: "DELETE",
  });
}

// ---------- Experiences ----------
export function fetchExperiences() {
  return request<any[]>("/api/experiences");
}

export function createExperience(payload: any) {
  return request<{ message: string; id: string }>("/api/experiences", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateExperience(id: string, payload: any) {
  return request<{ message: string }>(`/api/experiences/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteExperience(id: string) {
  return request<{ message: string }>(`/api/experiences/${id}`, {
    method: "DELETE",
  });
}

// ---------- Settings ----------
export function fetchSettings() {
  return request<any>("/api/settings");
}

export function updateSettings(payload: any) {
  return request<{ message: string }>("/api/settings", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// ---------- Messages ----------
export function fetchMessages() {
  return request<any[]>("/api/messages");
}

export function markMessage(id: number, isRead: boolean) {
  return request<{ message: string }>(`/api/messages/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ isRead }),
  });
}

export function deleteMessage(id: number) {
  return request<{ message: string }>(`/api/messages/${id}`, {
    method: "DELETE",
  });
}

export function submitContact(payload: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}) {
  return request<{ message: string }>("/api/contact", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ---------- Upload ----------
async function uploadFile(path: string, file: File): Promise<{ src: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(path, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || "Upload gagal");
  return body;
}

export function uploadProjectImage(file: File) {
  return uploadFile("/api/upload/project-image", file);
}

export function uploadProfileImage(file: File) {
  return uploadFile("/api/upload/profile-image", file);
}

export function uploadResume(file: File) {
  return uploadFile("/api/upload/resume", file);
}
