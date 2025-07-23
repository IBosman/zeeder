import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Check, ChevronRight } from "lucide-react";
import Sidebar from "@/components/sidebar";

// Mock data for the charts
const callsData = [
  { date: 'Jun 22', calls: 0 },
  { date: 'Jun 24', calls: 6 },
  { date: 'Jun 25', calls: 0 },
  { date: 'Jun 26', calls: 6 },
  { date: 'Jun 27', calls: 0 },
  { date: 'Jun 28', calls: 2 },
  { date: 'Jun 30', calls: 0 },
  { date: 'Jul 02', calls: 0 },
  { date: 'Jul 04', calls: 2 },
  { date: 'Jul 06', calls: 0 },
  { date: 'Jul 08', calls: 0 },
  { date: 'Jul 10', calls: 14 },
  { date: 'Jul 12', calls: 3 },
  { date: 'Jul 14', calls: 0 },
  { date: 'Jul 16', calls: 0 },
  { date: 'Jul 18', calls: 2 },
  { date: 'Jul 20', calls: 4 },
  { date: 'Jul 22', calls: 0 },
];

const successRateData = [
  { date: 'Jun 22', rate: 90 },
  { date: 'Jun 23', rate: 0 },
  { date: 'Jun 24', rate: 45 },
  { date: 'Jun 25', rate: 0 },
  { date: 'Jun 26', rate: 50 },
  { date: 'Jun 27', rate: 0 },
  { date: 'Jun 28', rate: 0 },
  { date: 'Jun 30', rate: 0 },
  { date: 'Jul 02', rate: 100 },
  { date: 'Jul 03', rate: 0 },
  { date: 'Jul 04', rate: 0 },
  { date: 'Jul 06', rate: 0 },
  { date: 'Jul 08', rate: 0 },
  { date: 'Jul 10', rate: 85 },
  { date: 'Jul 11', rate: 0 },
  { date: 'Jul 12', rate: 0 },
  { date: 'Jul 14', rate: 0 },
  { date: 'Jul 16', rate: 0 },
  { date: 'Jul 18', rate: 95 },
  { date: 'Jul 19', rate: 0 },
  { date: 'Jul 20', rate: 55 },
  { date: 'Jul 21', rate: 0 },
  { date: 'Jul 22', rate: 0 },
];

export default function Dashboard() {
  const [agentFilter, setAgentFilter] = useState("all-agents");
  const [timeFilter, setTimeFilter] = useState("last-month");
  const [username, setUsername] = useState("");

  useEffect(() => {
    // Get username from localStorage when component mounts
    const storedUsername = localStorage.getItem("username") || "";
    setUsername(storedUsername);
  }, []);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="px-8 py-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-foreground">Good afternoon {username ? username : "there"}</h1>
            <div className="flex items-center space-x-3">
              <Select value={agentFilter} onValueChange={setAgentFilter}>
                <SelectTrigger className="w-[140px] bg-background border-border">
                  <SelectValue placeholder="All agents" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-agents">All agents</SelectItem>
                  <SelectItem value="support-agent">Support agent</SelectItem>
                  <SelectItem value="test-2">TEST 2</SelectItem>
                </SelectContent>
              </Select>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-[140px] bg-background border-border">
                  <SelectValue placeholder="Last month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last-month">Last month</SelectItem>
                  <SelectItem value="last-week">Last week</SelectItem>
                  <SelectItem value="last-7-days">Last 7 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {/* Number of calls */}
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Number of calls</p>
                    <p className="text-3xl font-bold text-foreground">37</p>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Average duration */}
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-1">Average duration</p>
                <p className="text-3xl font-bold text-foreground">0:40</p>
              </CardContent>
            </Card>

            {/* Total cost */}
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-1">Total cost</p>
                <p className="text-3xl font-bold text-foreground">
                  10,307<span className="text-sm font-normal text-muted-foreground">credits</span>
                </p>
              </CardContent>
            </Card>

            {/* Average cost */}
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-1">Credits Remaining</p>
                <p className="text-3xl font-bold text-foreground">
                  22,087<span className="text-sm font-normal text-muted-foreground">credits</span>
                </p>
              </CardContent>
            </Card>

            {/* Purchase Tokens Button */}
            <a href="/billing?tab=credits" className="block">
              <Card className="bg-card border-border hover:border-primary transition-colors cursor-pointer h-full">
                <CardContent className="p-6 relative h-full flex flex-col justify-between">
                  <p className="text-3xl font-bold text-foreground">Top up</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-muted-foreground">Add more credits</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </a>
          </div>

          {/* Charts */}
          <div className="space-y-8">
            {/* Calls Chart */}
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="h-80 w-full">
                  {callsData && callsData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart 
                        data={callsData} 
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid 
                          strokeDasharray="none" 
                          stroke="#333" 
                          horizontal={true}
                          vertical={false}
                        />
                        <XAxis 
                          dataKey="date" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#888', fontSize: 11 }}
                          interval={0}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#888', fontSize: 11 }}
                          domain={[0, 16]}
                          width={40}
                        />
                        <Line 
                          type="linear" 
                          dataKey="calls" 
                          stroke="#ffffff" 
                          strokeWidth={1.5}
                          dot={{ 
                            fill: '#ffffff', 
                            stroke: '#ffffff', 
                            strokeWidth: 1, 
                            r: 3 
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      Chart loading...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Success Rate Chart */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                  Overall success rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full">
                  {successRateData && successRateData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart 
                        data={successRateData}
                        margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
                      >
                        <CartesianGrid 
                          strokeDasharray="none" 
                          stroke="#333" 
                          horizontal={true}
                          vertical={true}
                        />
                        <XAxis 
                          dataKey="date" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#888', fontSize: 11 }}
                          interval={0}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#888', fontSize: 11 }}
                          domain={[0, 100]}
                          ticks={[0, 25, 50, 75, 100]}
                          tickFormatter={(value) => `${value}%`}
                          width={50}
                        />
                        <Area 
                          type="linear" 
                          dataKey="rate" 
                          stroke="#22c55e"
                          fill="#22c55e"
                          fillOpacity={0.8}
                          strokeWidth={1}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      Chart loading...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}