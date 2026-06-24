// This re-exports everything from AuthContext so all existing imports
// across the app continue to work without any changes.
export { useAuthContext as useAuth, type AuthUser } from "@/context/AuthContext";