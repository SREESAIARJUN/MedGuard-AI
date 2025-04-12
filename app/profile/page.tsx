"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, User } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { getClientSupabaseClient } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

// Define the form schema
const profileFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }).optional(),
  walletAddress: z.string().optional(),
})

// Define the form values type
type FormValues = z.infer<typeof profileFormSchema>

export default function ProfilePage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const { toast } = useToast()
  const supabase = getClientSupabaseClient()

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      email: "",
      walletAddress: "",
    },
  })

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return

      try {
        setIsLoading(true)

        // Check if user exists in our database
        const { data: existingUser, error } = await supabase.from("users").select("*").eq("email", user.email).single()

        if (error && error.code !== "PGRST116") {
          // PGRST116 is "no rows returned" which is expected if user doesn't exist yet
          throw error
        }

        if (existingUser) {
          setUserProfile(existingUser)
          form.reset({
            email: existingUser.email || "",
            walletAddress: existingUser.wallet_address || "",
          })
        } else {
          // Create user profile if it doesn't exist
          const { data: newUser, error: insertError } = await supabase
            .from("users")
            .insert({ email: user.email })
            .select()
            .single()

          if (insertError) {
            throw insertError
          }

          setUserProfile(newUser)
          form.reset({
            email: newUser.email || "",
            walletAddress: newUser.wallet_address || "",
          })
        }
      } catch (error) {
        console.error("Error fetching user profile:", error)
        toast({
          title: "Error",
          description: "Failed to load your profile. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchUserProfile()
    }
  }, [user, supabase, form, toast])

  // Handle form submission
  async function onSubmit(values: FormValues) {
    if (!user || !userProfile) return

    try {
      setIsSaving(true)

      // Update user profile
      const { error } = await supabase
        .from("users")
        .update({
          wallet_address: values.walletAddress,
        })
        .eq("id", userProfile.id)

      if (error) {
        throw error
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Update failed",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen p-4 md:p-8 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

        {isLoading ? (
          <Card className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>Update your account preferences</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="your.email@example.com" {...field} disabled />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="walletAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wallet Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Your blockchain wallet address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <p className="text-sm text-muted-foreground">
                Account created:{" "}
                {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString() : "N/A"}
              </p>
            </CardFooter>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  )
}
