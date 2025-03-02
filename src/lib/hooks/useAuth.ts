import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { supabaseAdmin } from "../supabase-admin";
import { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const initializeUser = async (user: User) => {
    try {
      // Apenas verificar se o usuário existe na tabela users
      // NÃO criar automaticamente - o usuário só deve ser criado após pagamento
      const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (fetchError?.code === "PGRST116") {
        console.log(
          "User not found in users table - waiting for payment confirmation",
        );
        // Não criar o usuário aqui - apenas retornar true para continuar o fluxo
        // O usuário será criado pelo backend após confirmação do pagamento
        return true;
      } else if (fetchError) {
        console.error("Error fetching user:", fetchError);
        return false;
      }

      console.log("User found in users table:", existingUser);
      return true;
    } catch (error) {
      console.error("Error initializing user:", error);
      return false;
    }
  };

  useEffect(() => {
    let mounted = true;
    let timeoutId: number;

    // Add a timeout to ensure initialization completes
    timeoutId = window.setTimeout(() => {
      if (mounted && loading) {
        console.log("Auth initialization timed out, forcing completion");
        setInitialized(true);
        setLoading(false);
      }
    }, 5000);

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
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading, initialized };
}
