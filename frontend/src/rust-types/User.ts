export interface User {
  username: string;
  email: string | null;
  phone: string | null;
  roles: string[];
}