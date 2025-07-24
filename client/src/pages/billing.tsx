import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PaymentModal } from "@/components/PaymentModal";
import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogClose } from "@/components/ui/dialog";

interface PlanDetails {
  isOpen: boolean;
  creditAmount: number;
  price: number;
  pricePerCredit: number;
}

export default function Billing() {
  const [tab, setTab] = useState("credits");
  const [selectedPlan, setSelectedPlan] = useState<PlanDetails>({
    isOpen: false,
    creditAmount: 0,
    price: 0,
    pricePerCredit: 0,
  });

  const openPaymentModal = (creditAmount: number, price: number, pricePerCredit: number) => {
    setSelectedPlan({
      isOpen: true,
      creditAmount,
      price,
      pricePerCredit,
    });
  };

  const closePaymentModal = () => {
    setSelectedPlan(prev => ({ ...prev, isOpen: false }));
  };
  
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-4 md:pl-8 md:pr-8 py-4 md:py-6 border-b border-border sticky top-0 z-30 bg-background">
        <h1 className="text-2xl font-semibold text-foreground">Billing</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-4 md:px-8 md:py-6">
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="credits">Credits</TabsTrigger>
            <TabsTrigger value="methods">Payment</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>
          
          <TabsContent value="credits" className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Buy Credits</h2>
              <p className="text-sm text-muted-foreground mb-6">Buy credits to use for your account. Credits never expire.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {/* First Row */}
                <Card className="border-border hover:border-primary transition-colors">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-2xl font-bold">100</h3>
                        <p className="text-sm text-muted-foreground">Credits</p>
                      </div>
                      <Badge variant="outline" className="text-xs">$10.00</Badge>
                    </div>
                    <div className="flex justify-between items-end">
                      <p className="text-sm text-muted-foreground">$0.10 per credit</p>
                      <Button 
                        size="sm" 
                        className="h-8"
                        onClick={() => openPaymentModal(100, 10.00, 0.10)}
                      >
                        Buy now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-border hover:border-primary transition-colors">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-2xl font-bold">500</h3>
                        <p className="text-sm text-muted-foreground">Credits</p>
                      </div>
                      <Badge variant="outline" className="text-xs">$45.00</Badge>
                    </div>
                    <div className="flex justify-between items-end">
                      <p className="text-sm text-muted-foreground">$0.09 per credit</p>
                      <Button 
                        size="sm" 
                        className="h-8"
                        onClick={() => openPaymentModal(500, 45.00, 0.09)}
                      >
                        Buy now
                      </Button>
                    </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border hover:border-primary transition-colors">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-2xl font-bold">1,000</h3>
                          <p className="text-sm text-muted-foreground">Credits</p>
                        </div>
                        <Badge variant="outline" className="text-xs">$80.00</Badge>
                      </div>
                      <div className="flex justify-between items-end">
                        <p className="text-sm text-muted-foreground">$0.08 per credit</p>
                        <Button 
                          size="sm" 
                          className="h-8"
                          onClick={() => openPaymentModal(1000, 80.00, 0.08)}
                        >
                          Buy now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-border hover:border-primary transition-colors">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-2xl font-bold">2,500</h3>
                          <p className="text-sm text-muted-foreground">Credits</p>
                        </div>
                        <Badge variant="outline" className="text-xs">$175.00</Badge>
                      </div>
                      <div className="flex justify-between items-end">
                        <p className="text-sm text-muted-foreground">$0.07 per credit</p>
                        <Button 
                          size="sm" 
                          className="h-8"
                          onClick={() => openPaymentModal(2500, 175.00, 0.07)}
                        >
                          Buy now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Second Row */}
                  <Card className="border-border hover:border-primary transition-colors">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-2xl font-bold">5,000</h3>
                          <p className="text-sm text-muted-foreground">Credits</p>
                        </div>
                        <Badge variant="outline" className="text-xs">$300.00</Badge>
                      </div>
                      <div className="flex justify-between items-end">
                        <p className="text-sm text-muted-foreground">$0.06 per credit</p>
                        <Button 
                          size="sm" 
                          className="h-8"
                          onClick={() => openPaymentModal(5000, 300.00, 0.06)}
                        >
                          Buy now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border hover:border-primary transition-colors">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-2xl font-bold">10,000</h3>
                          <p className="text-sm text-muted-foreground">Credits</p>
                        </div>
                        <Badge variant="outline" className="text-xs">$500.00</Badge>
                      </div>
                      <div className="flex justify-between items-end">
                        <p className="text-sm text-muted-foreground">$0.05 per credit</p>
                        <Button 
                          size="sm" 
                          className="h-8"
                          onClick={() => openPaymentModal(10000, 500.00, 0.05)}
                        >
                          Buy now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border hover:border-primary transition-colors">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-2xl font-bold">25,000</h3>
                          <p className="text-sm text-muted-foreground">Credits</p>
                        </div>
                        <Badge variant="outline" className="text-xs">$1,000.00</Badge>
                      </div>
                      <div className="flex justify-between items-end">
                        <p className="text-sm text-muted-foreground">$0.04 per credit</p>
                        <Button 
                          size="sm" 
                          className="h-8"
                          onClick={() => openPaymentModal(25000, 1000.00, 0.04)}
                        >
                          Buy now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border hover:border-primary transition-colors">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-2xl font-bold">50,000</h3>
                          <p className="text-sm text-muted-foreground">Credits</p>
                        </div>
                        <Badge variant="outline" className="text-xs">$1,500.00</Badge>
                      </div>
                      <div className="flex justify-between items-end">
                        <p className="text-sm text-muted-foreground">$0.03 per credit</p>
                        <Button 
                          size="sm" 
                          className="h-8"
                          onClick={() => openPaymentModal(50000, 1500.00, 0.03)}
                        >
                          Buy now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-muted/50 p-4 rounded-lg gap-4">
                  <div>
                    <h4 className="font-medium">Need more credits?</h4>
                    <p className="text-sm text-muted-foreground">Contact our sales team for custom plans</p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">Contact Sales</Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="methods">
              <div className="flex flex-col items-center px-4">
                <Card className="w-full max-w-[350px] mb-6 border-border bg-card">
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
                        <div className="flex flex-col sm:flex-row gap-2 mb-2">
                          <Input placeholder="City" className="flex-1 mb-2 sm:mb-0" />
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
              <div className="flex justify-center">
                <div className="w-full max-w-4xl px-4">
                  <div className="mb-4 text-sm text-muted-foreground">Showing invoices within the past 12 months</div>
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <div className="min-w-[600px]">
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
                              <td className="py-2 pr-4 font-mono text-xs sm:text-sm">{invoice.id}</td>
                              <td className="py-2 pr-4"><Badge className="bg-green-200 text-green-900 font-medium text-xs">{invoice.status}</Badge></td>
                              <td className="py-2 pr-4 text-xs sm:text-sm">{invoice.amount}</td>
                              <td className="py-2 pr-4 whitespace-nowrap text-xs sm:text-sm">{invoice.created}</td>
                              <td className="py-2"><Button variant="link" size="sm" className="px-0 h-auto text-xs sm:text-sm">View</Button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="preferences">
              <div className="flex justify-center">
                <Card className="w-full max-w-4xl bg-card border-border">
                  <CardContent className="p-4 sm:p-6 md:p-8">
                    <div className="mb-6 text-sm text-muted-foreground text-center">
                      Changes to these preferences will apply to future invoices only. If you need a past invoice reissued, please contact <a href="mailto:support@zeeder.ai" className="underline">support@zeeder.ai</a>.
                    </div>
                    <form className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Company name</label>
                        <div className="text-xs text-muted-foreground mb-1">If specified, this name will appear on invoices instead of your organization name.</div>
                        <Input placeholder="Company name" defaultValue="" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Purchase order (PO) number</label>
                        <div className="text-xs text-muted-foreground mb-1">Your PO number will be displayed on future invoices.</div>
                        <Input placeholder="PO number" defaultValue="" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Billing email</label>
                        <div className="text-xs text-muted-foreground mb-1">Invoices and other billing notifications will be sent here (in addition to being sent to the owners of your organization).</div>
                        <Input placeholder="Billing email" defaultValue="" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Primary business address</label>
                        <div className="text-xs text-muted-foreground mb-1">This is the physical address of the company purchasing services and is used to calculate any applicable sales tax.</div>
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
                        <div className="flex flex-col sm:flex-row gap-2 mb-2">
                          <Input placeholder="City" className="flex-1 mb-2 sm:mb-0" />
                          <Input placeholder="Postal code" className="flex-1" />
                        </div>
                        <Input placeholder="State, county, province, or region" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Business tax ID</label>
                        <div className="text-xs text-muted-foreground mb-1">If you are a business tax registrant, please enter your business tax ID here.</div>
                        <div className="flex gap-2">
                          <select className="w-1/3 rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm text-foreground">
                            <option value="">Select type</option>
                            <option value="VAT">VAT</option>
                            <option value="GST">GST</option>
                            <option value="ABN">ABN</option>
                            <option value="EIN">EIN</option>
                          </select>
                          <Input placeholder="Business tax ID" className="flex-1" />
                        </div>
                      </div>
                      <div className="flex justify-end pt-4">
                        <Button type="submit">Save preferences</Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      {/* Payment Modal */}
      <PaymentModal
        isOpen={selectedPlan.isOpen}
        onClose={closePaymentModal}
        creditAmount={selectedPlan.creditAmount}
        price={selectedPlan.price}
        pricePerCredit={selectedPlan.pricePerCredit}
      />
    </div>
  );
}