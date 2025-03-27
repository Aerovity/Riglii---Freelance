import { useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabase"; // adjust the path to your client

export default function Onboarding() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    const upsertUser = async () => {
      if (!user) return;

      // OPTIONAL: Check if user already exists
      const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", user.id)
        .single();

      if (!existingUser) {
        const { error: insertError } = await supabase.from("users").insert([
          {
            clerk_id: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            is_freelancer: false,
          },
        ]);

        if (insertError) {
          console.error("Error inserting user:", insertError);
        }
      }

      // Redirect after onboarding
      router.push("/dashboard");
    };

    if (isLoaded) {
      upsertUser();
    }
  }, [isLoaded, user]);

  return <p>Setting things up for you...</p>;
}
