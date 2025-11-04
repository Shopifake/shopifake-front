import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, AlertTriangle } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { mockRevenueData, mockCategoryData } from "../../lib/mock-data";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const COLORS = ['#3B82F6', '#22C55E', '#8B5CF6', '#F59E0B', '#EC4899'];

export function DashboardOverview() {
  const metrics = [
    {
      title: "Total Revenue",
      value: "$45,231",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-[#3B82F6]",
    },
    {
      title: "Conversion Rate",
      value: "3.24%",
      change: "+0.8%",
      trend: "up",
      icon: TrendingUp,
      color: "text-[#22C55E]",
    },
    {
      title: "Total Orders",
      value: "1,249",
      change: "-4.2%",
      trend: "down",
      icon: ShoppingCart,
      color: "text-[#8B5CF6]",
    },
    {
      title: "Low Stock Items",
      value: "8",
      change: "+2",
      trend: "warning",
      icon: AlertTriangle,
      color: "text-[#F59E0B]",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Dashboard Overview</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your store.</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="7days">
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="year">This year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">Export Report</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">{metric.title}</CardTitle>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{metric.value}</div>
                <div className="flex items-center gap-1 text-sm">
                  {metric.trend === "up" && <TrendingUp className="h-3 w-3 text-[#22C55E]" />}
                  {metric.trend === "down" && <TrendingDown className="h-3 w-3 text-destructive" />}
                  {metric.trend === "warning" && <AlertTriangle className="h-3 w-3 text-[#F59E0B]" />}
                  <span className={
                    metric.trend === "up" ? "text-[#22C55E]" : 
                    metric.trend === "down" ? "text-destructive" : 
                    "text-[#F59E0B]"
                  }>
                    {metric.change}
                  </span>
                  <span className="text-muted-foreground">from last period</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={mockRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockCategoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {mockCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: "Wireless Headphones Pro", sales: 234, revenue: "$70,166" },
              { name: "Smart Watch Series 5", sales: 189, revenue: "$75,598" },
              { name: "Minimalist Leather Wallet", sales: 156, revenue: "$7,798" },
            ].map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-muted rounded-lg h-12 w-12 flex items-center justify-center">
                    <Package className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p>{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.sales} sales</p>
                  </div>
                </div>
                <div className="text-right">
                  <p>{product.revenue}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
