import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const initializeUser = async (user: User) => {
    try {
      // Try to fetch existing user
      const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      // If user doesn't exist, create them
      if (fetchError?.code === "PGRST116") {
        const { data: newUser, error: createError } = await supabase
          .from("users")
          .insert([
            {
              id: user.id,
              email: user.email,
              name: user.user_metadata.name || "Anonymous User",
              phone: user.user_metadata.phone,
              credits: 37000,
            },
          ])
          .select()
          .single();

        if (createError || !newUser) {
          console.error("Error creating user:", createError);
          return false;
        }

        console.log("Created new user:", newUser);
      } else if (fetchError) {
        console.error("Error fetching user:", fetchError);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error initializing user:", error);
      return false;
    }
  };

  useEffect(() => {
    let mounted = true;

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        setUser(session.user);
        initializeUser(session.user).then((success) => {
          if (!mounted) return;
          if (success) {
            setInitialized(true);
          }
          setLoading(false);
        });
      } else {
        setUser(null);
        setInitialized(true);
        setLoading(false);
      }
    });

    // Auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        setUser(session.user);
        initializeUser(session.user).then((success) => {
          if (!mounted) return;
          if (success) {
            setInitialized(true);
          }
          setLoading(false);
        });
      } else {
        setUser(null);
        setInitialized(true);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading, initialized };
}
