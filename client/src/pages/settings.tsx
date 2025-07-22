import Sidebar from "@/components/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function Settings() {
  const [tab, setTab] = useState("user");
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="px-8 py-6 border-b border-border">
          <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        </div>
        <div className="flex-1 px-8 py-6 overflow-y-auto">
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="user">User</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>
            <TabsContent value="user">
              <div className="flex flex-col items-center">
                <Card className="w-full max-w-xl bg-card border-border">
                  <CardContent className="p-8">
                    <form className="space-y-6">
                      <div>
                        <Label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">Name</Label>
                        <div className="text-xs text-muted-foreground mb-1">The name associated with this account</div>
                        <Input id="name" defaultValue="Dona" />
                      </div>
                      <div>
                        <Label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">Email address</Label>
                        <div className="text-xs text-muted-foreground mb-1">The email address associated with this account</div>
                        <Input id="email" defaultValue="dona@zillion.co.za" disabled />
                      </div>
                      <div>
                        <Label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1">Phone number</Label>
                        <div className="text-xs text-muted-foreground mb-1">The phone number associated with this account</div>
                        <Input id="phone" defaultValue="" />
                      </div>
                      <div className="pt-2">
                        <Button type="submit">Save</Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="security">
              <div className="flex flex-col items-center">
                <Card className="w-full max-w-xl bg-card border-border">
                  <CardContent className="p-8">
                    <div className="flex flex-col gap-8 items-center">
                      <div className="w-full">
                        <div className="text-lg font-semibold text-foreground mb-1">Multi-factor authentication (MFA)</div>
                        <div className="text-sm text-muted-foreground mb-4">
                          Require an extra security challenge when logging in. If you are unable to pass this challenge, you will have the option to recover your account via email.
                        </div>
                        <Button className="mb-2">Enable MFA</Button>
                      </div>
                      <div className="w-full">
                        <div className="text-base font-medium text-foreground mb-1">Log out of all devices</div>
                        <div className="text-sm text-muted-foreground mb-4">
                          Log out of all active sessions across all devices, including your current session.
                        </div>
                        <Button variant="secondary">Log out all</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
} 