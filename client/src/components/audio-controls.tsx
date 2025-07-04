import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, Settings, Download, ChevronDown } from "lucide-react";

export default function AudioControls() {
  const [progress] = useState(0);
  const [isPlaying] = useState(false);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4">
      <div className="flex items-center justify-between max-w-full">
        <div className="flex items-center space-x-4">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-foreground">Keo</span>
          <span className="text-xs text-muted-foreground">Default voice preview</span>
        </div>
        
        <div className="flex items-center space-x-4 flex-1 justify-center">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <Volume2 className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">0:00</span>
            <div className="w-96 h-1 bg-muted rounded-full relative">
              <div 
                className="absolute left-0 top-0 h-full bg-foreground rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              />
              <div 
                className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-foreground rounded-full transition-all duration-300" 
                style={{ left: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">0:23</span>
          </div>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="secondary" size="sm" className="bg-muted hover:bg-muted/80">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
