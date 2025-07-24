import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

interface AddPaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentMethodAdded: () => void;
}

export function AddPaymentMethodModal({ isOpen, onClose, onPaymentMethodAdded }: AddPaymentMethodModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    onPaymentMethodAdded();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-md max-h-[90vh] overflow-y-auto p-0 [&>button]:hidden">
        <DialogHeader className="border-b p-6 pb-4 relative">
          <DialogTitle>Add Payment Method</DialogTitle>
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
        
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input id="cardNumber" placeholder="1234 5678 9012 3456" required />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry</Label>
                <Input id="expiry" placeholder="MM/YY" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input id="cvv" placeholder="123" required />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Name on Card</Label>
              <Input id="name" placeholder="John Doe" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="country">Country/Region</Label>
              <select 
                id="country" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="">Select a country</option>
                <option value="US">United States</option>
                <option value="GB">United Kingdom</option>
                <option value="ZA">South Africa</option>
                <option value="IN">India</option>
                <option value="CA">Canada</option>
                <option value="AU">Australia</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Billing Address</Label>
              <Input id="address" placeholder="123 Main St" required />
              <Input placeholder="Address line 2 (optional)" className="mt-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" placeholder="New York" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input id="postalCode" placeholder="10001" required />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="state">Email</Label>
              <Input id="state" placeholder="you@example.com" required />
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <input 
                type="checkbox" 
                id="default" 
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                defaultChecked
              />
              <Label htmlFor="default" className="text-sm font-medium leading-none">
                Set as default payment method
              </Label>
            </div>
            
            <div className="pt-4">
              <Button type="submit" className="w-full">
                Add payment method
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
