"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Package, 
  Users, 
  BarChart3, 
  Settings, 
  Tag,
  Building2
} from "lucide-react";

const cards = [
  {
    href: "/assets",
    title: "Assets",
    description: "Manage rental assets, specifications, and attachments",
    icon: Package,
    color: "text-blue-500",
  },
  {
    href: "/customers",
    title: "Customers",
    description: "Manage customers, documents, and rental assignments",
    icon: Users,
    color: "text-green-500",
  },
  {
    href: "/asset-conditions",
    title: "Conditions & Values",
    description: "Track asset conditions and current market values",
    icon: BarChart3,
    color: "text-purple-500",
  },
  {
    href: "/setup",
    title: "Setup",
    description: "Configure categories, manufacturers, and specifications",
    icon: Settings,
    color: "text-orange-500",
  },
  {
    href: "/setup/defined-conditions",
    title: "Defined Conditions",
    description: "Manage condition types like New, Under Repair, etc.",
    icon: Tag,
    color: "text-pink-500",
  },
];

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Hero */}
      <div className="text-center py-12">
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-full bg-primary/10">
            <Building2 className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Asset Rental System
        </h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
          Manage your rental assets, customers, and transactions efficiently
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} href={card.href} className="group">
              <Card className="h-full transition-all duration-200 hover:shadow-lg hover:border-primary/50 group-hover:-translate-y-1">
                <CardHeader>
                  <div className={`p-3 rounded-lg bg-muted w-fit ${card.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="mt-4">{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
