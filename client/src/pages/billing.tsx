import Sidebar from "@/components/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PaymentModal } from "@/components/PaymentModal";
import { useState } from "react";

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
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="px-8 py-6 border-b border-border">
          <h1 className="text-2xl font-semibold text-foreground">Billing</h1>
        </div>
        <div className="flex-1 px-8 py-6 overflow-y-auto">
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="credits">Credits</TabsTrigger>
              <TabsTrigger value="methods">Payment methods</TabsTrigger>
              <TabsTrigger value="history">Billing history</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>
            <TabsContent value="credits" className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Buy Credits</h2>
                <p className="text-sm text-muted-foreground mb-6">Buy credits to use for your account. Credits never expire.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  {/* 100 Credits */}
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
                  
                  {/* 500 Credits */}
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

                  {/* 1,000 Credits */}
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
                  
                  {/* 2,500 Credits */}
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

                  {/* 5,000 Credits */}
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

                  {/* 10,000 Credits */}
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

                  {/* 25,000 Credits */}
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

                  {/* 50,000 Credits */}
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

                <div className="mt-12 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">Need more credits?</h3>
                    <p className="text-sm text-muted-foreground">
                      Contact our sales team for custom enterprise plans and volume discounts.
                    </p>
                  </div>
                  <Button variant="outline" className="ml-4">Contact Sales</Button>
                </div>
              </div>
            </TabsContent>

            {/* Other Tabs */}
            <TabsContent value="methods" className="space-y-6">
              <h2 className="text-lg font-semibold">Payment Methods</h2>
              <p className="text-sm text-muted-foreground">Manage your saved payment methods.</p>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <h2 className="text-lg font-semibold">Billing History</h2>
              <p className="text-sm text-muted-foreground">View your past transactions and invoices.</p>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-6">
              <h2 className="text-lg font-semibold">Billing Preferences</h2>
              <p className="text-sm text-muted-foreground">Update your billing preferences and notifications.</p>
            </TabsContent>
          </Tabs>
        </div>
      </main>

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
