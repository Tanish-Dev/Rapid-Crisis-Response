import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getToken } from "firebase/messaging";
import { auth, messaging } from "../firebase";
import { api } from "../api";
import app from "../firebase";

export const AuthContext = createContext(null);

const db = getFirestore(app);
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined);
  const [role, setRole] = useState(null);
  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      return;
    }

    if (typeof Notification === "undefined" || Notification.permission !== "granted" || !VAPID_KEY) {
      return;
    }

    const registerToken = async () => {
      try {
        if (!messaging) return;
        const fcmToken = await getToken(messaging, { vapidKey: VAPID_KEY });
        const rolePayload = role || "general";
        const departmentPayload = department || role || "general";
        await api.post("/api/register-device", {
          role: rolePayload,
          department: departmentPayload,
          fcm_token: fcmToken,
        });
      } catch (error) {
        console.warn("FCM registration skipped:", error);
      }
    };

    registerToken();
  }, [role, department, user]);

  useEffect(() => {
    let unsubscribe = () => {};

    try {
      unsubscribe = onAuthStateChanged(
        auth,
        async (firebaseUser) => {
          try {
            if (firebaseUser) {
              console.log("[Auth] UID:", firebaseUser.uid);
              const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
              console.log("[Auth] Doc exists:", userDoc.exists());
              if (userDoc.exists()) {
                console.log("[Auth] Doc data:", userDoc.data());
              }
              const fetchedRole = userDoc.exists()
                ? userDoc.data().role || null
                : null;
              const fetchedDepartment = userDoc.exists()
                ? userDoc.data().department || fetchedRole
                : null;
              console.log("[Auth] Fetched role:", fetchedRole, "department:", fetchedDepartment);
              setRole(fetchedRole);
              setDepartment(fetchedDepartment);
              setUser(firebaseUser);
            } else {
              setUser(null);
              setRole(null);
              setDepartment(null);
            }
          } catch (err) {
            console.error("[Auth] Firestore fetch error:", err);
            setUser(firebaseUser || null);
            setRole(null);
            setDepartment(null);
          } finally {
            setLoading(false);
          }
        },
        () => {
          setUser(null);
          setRole(null);
          setDepartment(null);
          setLoading(false);
        },
      );
    } catch {
      setUser(null);
      setRole(null);
      setDepartment(null);
      setLoading(false);
    }

    return unsubscribe;
  }, []);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, role, department, loading, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
