import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card as CardComponent } from "@/components/ui/card";
import { CreditCard, X } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  creditAmount: number;
  price: number;
  pricePerCredit: number;
}

export function PaymentModal({ isOpen, onClose, creditAmount, price, pricePerCredit }: PaymentModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-[800px] max-h-[90vh] overflow-y-auto p-0 [&>button]:hidden">
        <DialogHeader className="border-b p-6 pb-4 relative">
          <DialogTitle>Complete Payment</DialogTitle>
          <DialogPrimitive.Close asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-4 top-4 h-8 w-8 p-0 rounded-full"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogPrimitive.Close>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 px-1">
          {/* Left Column - Payment Form */}
          <div className="space-y-4 px-2">
            <h3 className="font-medium">Payment Method</h3>
            
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry</Label>
                <Input id="expiry" placeholder="MM/YY" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input id="cvv" placeholder="123" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Name on Card</Label>
              <Input id="name" placeholder="John Doe" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="country">Country/Region</Label>
              <select id="country" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="">Select a country</option>
                <option value="US">United States</option>
                <option value="GB">United Kingdom</option>
                <option value="CA">Canada</option>
                <option value="AU">Australia</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="ES">Spain</option>
                <option value="IT">Italy</option>
                <option value="JP">Japan</option>
                <option value="CN">China</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Billing Address</Label>
              <Input id="address" placeholder="123 Main St" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" placeholder="New York" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input id="postalCode" placeholder="10001" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" />
            </div>
          </div>
          
          {/* Right Column - Order Summary */}
          <div className="space-y-4 px-2">
            <h3 className="font-medium">Order Summary</h3>
            
            <CardComponent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">${pricePerCredit.toFixed(2)} × {creditAmount.toLocaleString()} credits</span>
                  <span className="font-medium">${price.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm text-muted-foreground">Tax</span>
                  <span className="text-sm">$0.00</span>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t font-medium">
                  <span>Total</span>
                  <span>${price.toFixed(2)}</span>
                </div>
              </div>
            </CardComponent>
            
            <div className="pt-2">
              <Button className="w-full" size="lg">
                Pay ${price.toFixed(2)}
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Your payment is secure and encrypted
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground text-center">
              <CreditCard className="h-4 w-4 flex-shrink-0" />
              <span>We accept all major credit cards</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
