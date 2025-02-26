import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.0.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get("stripe-signature");
    const body = await req.text();

    const event = stripe.webhooks.constructEvent(
      body,
      signature || "",
      Deno.env.get("STRIPE_WEBHOOK_SECRET") || "",
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      console.log("Received session:", session);

      // Create Supabase client
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") || "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
      );

      try {
        // First try to find existing session
        const { data: existingSession, error: findError } = await supabaseClient
          .from("stripe_sessions")
          .select("*")
          .eq("session_id", session.id)
          .single();

        if (findError && findError.code === "PGRST116") {
          // Session doesn't exist, create it
          const { error: insertError } = await supabaseClient
            .from("stripe_sessions")
            .insert({
              session_id: session.id,
              status: "verified",
              email: session.customer_email,
            });

          if (insertError) throw insertError;
        } else if (!findError) {
          // Session exists, update it
          const { error: updateError } = await supabaseClient
            .from("stripe_sessions")
            .update({
              status: "verified",
              email: session.customer_email,
            })
            .eq("session_id", session.id);

          if (updateError) throw updateError;
        }

        console.log("Successfully processed session", session.id);
      } catch (error) {
        console.error("Error processing session:", error);
        throw error;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
