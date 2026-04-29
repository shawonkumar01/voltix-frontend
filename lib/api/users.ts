import api from "./client";

export const usersApi = {
  getProfile: () => api.get("/users/me"),

  updateProfile: (data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
    dateOfBirth?: string;
    avatar?: string;
  }) => api.patch("/users/me", data),

  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }) => api.post("/users/change-password", data),
};
