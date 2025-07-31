import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MoreHorizontal, Volume2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLocation } from "wouter";

export default function AdminVoicesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [voices, setVoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const syncVoices = async () => {
    setSyncing(true);
    setError(null);
    const toastId = toast.loading('Synchronizing voices...');
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/voices/sync", {
        method: "POST",
        headers: {
          "Authorization": token ? `Bearer ${token}` : "",
          "Content-Type": "application/json"
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to sync voices');
      }
      
      // Refresh the voices list after successful sync
      await fetchVoices();
      toast.success('Voices synchronized successfully', { id: toastId });
    } catch (err: any) {
      console.error('Error syncing voices:', err);
      toast.error(err.message || 'Failed to sync voices', { id: toastId });
      setError(err.message || 'An error occurred while syncing voices');
    } finally {
      setSyncing(false);
    }
  };
  
  const fetchVoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/voices", {
        headers: {
          "Authorization": token ? `Bearer ${token}` : "",
          "Content-Type": "application/json"
        },
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || `Failed to fetch voices: ${res.status}`);
      }
      
      setVoices(data.voices || []);
    } catch (err: any) {
      console.error('Error fetching voices:', err);
      setError(err.message || 'An error occurred while fetching voices');
    } finally {
      setLoading(false);
    }
  };
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('role') !== 'admin') {
      setLocation('/login');
    }
  }, [setLocation]);

  useEffect(() => {
    fetchVoices();
  }, []);

  const filteredVoices = voices.filter(voice =>
    voice.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    voice.voiceId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col">
      <main className="flex-1 flex flex-col">
        <header className="px-8 py-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Voices</h1>
              <p className="text-sm text-muted-foreground mt-1">Manage available voices</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={syncVoices}
                disabled={syncing}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing...' : 'Sync Voices'}
              </Button>
              <Button onClick={() => setLocation("/admin/voices/new")}>
                Add Voice
              </Button>
            </div>
          </div>
        </header>
        
        {error && (
          <div className="mx-8 mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <div className="flex-1 px-8 py-6">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search voices..."
                className="pl-10 w-full max-w-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Loading voices...
                    </TableCell>
                  </TableRow>
                ) : filteredVoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No voices found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVoices.map((voice) => (
                    <TableRow key={voice.voiceId}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Volume2 className="h-4 w-4 mr-2 text-muted-foreground" />
                          {voice.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-sm">
                        {voice.voiceId}
                      </TableCell>
                      <TableCell>
                        {voice.category && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                            {voice.category}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(voice.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  );
}
