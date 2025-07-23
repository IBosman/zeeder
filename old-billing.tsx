import Sidebar from "@/components/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger, DialogContent, DialogClose } from "@/components/ui/dialog";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export default function Billing() {
  const [tab, setTab] = useState("methods");
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="px-8 py-6 border-b border-border">
          <h1 className="text-2xl font-semibold text-foreground">Billing</h1>
        </div>
        <div className="flex-1 px-8 py-6">
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="methods">Payment methods</TabsTrigger>
              <TabsTrigger value="history">Billing history</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>
            <TabsContent value="methods">
              <div className="flex flex-col items-center">
                <Card className="w-[350px] mb-6 border-border bg-card">
                  <CardContent className="p-5 flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" className="h-7 w-12 rounded" />
                      <span className="text-lg tracking-widest">••••8490</span>
                      <Button variant="secondary" size="sm" className="ml-auto cursor-default" disabled>Default</Button>
                    </div>
                    <div className="text-xs text-muted-foreground ml-16">Expires 07/2028</div>
                    <Button variant="link" size="sm" className="text-destructive w-fit pl-0">Delete</Button>
                  </CardContent>
                </Card>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="secondary" className="w-[250px]">Add payment method</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md w-full rounded-2xl">
                    <div className="p-1">
                      <h2 className="text-lg font-semibold mb-1">Add payment method</h2>
                      <p className="text-sm text-muted-foreground mb-4">Add your credit card details below. This card will be saved to your account and can be removed at any time.</p>
                      <div className="mb-2">
                        <div className="text-xs font-medium mb-1">Card information</div>
                        <div className="flex gap-2">
                          <Input placeholder="Card number" className="flex-1" />
                          <Input placeholder="MM / YY" className="w-20" />
                          <Input placeholder="CVC" className="w-16" />
                        </div>
                      </div>
                      <div className="mb-2">
                        <div className="text-xs font-medium mb-1">Name on card</div>
                        <Input placeholder="" />
                      </div>
                      <div className="mb-2">
                        <div className="text-xs font-medium mb-1">Billing address</div>
                        <select className="w-full mb-2 rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm text-foreground">
                          <option value="">Country</option>
                          <option value="US">United States</option>
                          <option value="GB">United Kingdom</option>
                          <option value="ZA">South Africa</option>
                          <option value="IN">India</option>
                          <option value="CA">Canada</option>
                          <option value="AU">Australia</option>
                        </select>
                        <Input placeholder="Address line 1" className="mb-2" />
                        <Input placeholder="Address line 2" className="mb-2" />
                        <div className="flex gap-2 mb-2">
                          <Input placeholder="City" className="flex-1" />
                          <Input placeholder="Postal code" className="flex-1" />
                        </div>
                        <Input placeholder="State, county, province, or region" />
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <input type="checkbox" id="default" className="accent-primary h-4 w-4 rounded" />
                        <label htmlFor="default" className="text-sm">Set as default payment method</label>
                      </div>
                      <div className="flex justify-end gap-2 mt-6">
                        <DialogClose asChild>
                          <Button variant="secondary">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Add payment method</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </TabsContent>
            <TabsContent value="history">
              <div className="flex flex-col items-center w-full">
                <div className="w-full max-w-4xl mt-8">
                  <div className="mb-4 text-sm text-muted-foreground">Showing invoices within the past 12 months</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-y-2">
                      <thead>
                        <tr className="text-xs text-muted-foreground">
                          <th className="font-medium pb-2">INVOICE</th>
                          <th className="font-medium pb-2">STATUS</th>
                          <th className="font-medium pb-2">AMOUNT</th>
                          <th className="font-medium pb-2">CREATED</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { id: "04DE6D22-0005", status: "Paid", amount: "$6.90", created: "30 Jun 2025, 14:35" },
                          { id: "04DE6D22-0004", status: "Paid", amount: "$6.90", created: "26 Jun 2025, 13:17" },
                          { id: "04DE6D22-0003", status: "Paid", amount: "$6.90", created: "24 Jun 2025, 11:37" },
                          { id: "04DE6D22-0002", status: "Paid", amount: "$6.90", created: "20 Jun 2025, 08:07" },
                          { id: "04DE6D22-0001", status: "Paid", amount: "$5.75", created: "09 Apr 2025, 13:16" },
                        ].map((invoice) => (
                          <tr key={invoice.id} className="text-sm border-b border-border hover:bg-muted/30 transition-colors">
                            <td className="py-2 pr-4 font-mono">{invoice.id}</td>
                            <td className="py-2 pr-4"><Badge className="bg-green-200 text-green-900 font-medium">{invoice.status}</Badge></td>
                            <td className="py-2 pr-4">{invoice.amount}</td>
                            <td className="py-2 pr-4 whitespace-nowrap">{invoice.created}</td>
                            <td className="py-2"><Button variant="link" size="sm" className="px-0">View</Button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="preferences">
              <div className="text-muted-foreground text-center mt-10">No preferences set.</div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
} 