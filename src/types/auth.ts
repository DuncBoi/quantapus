import { User } from "firebase/auth";

export interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: () => Promise<User>;
    logout: () => Promise<void>;
}