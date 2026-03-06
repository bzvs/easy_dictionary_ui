import { apiClient } from "../api/apiClient";

const getCurrentUser = () => {
  return apiClient.get("/user/me");
};

const UserService = {
  getCurrentUser
}

export default UserService;