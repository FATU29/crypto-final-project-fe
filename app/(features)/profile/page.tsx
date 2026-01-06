"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { authService } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Crown, Mail, User, Calendar, Sparkles } from "lucide-react";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [isUpgrading, setIsUpgrading] = useState(false);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Please log in to view your profile.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleUpgrade = async () => {
    try {
      setIsUpgrading(true);
      await authService.upgradeAccount("VIP");
      await refreshUser();
      toast.success("Account upgraded to VIP successfully!", {
        description: "You now have access to AI-powered analysis features.",
      });
    } catch (error) {
      toast.error("Failed to upgrade account", {
        description:
          error instanceof Error ? error.message : "Please try again later.",
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  const getFullName = () => {
    return `${user.firstName} ${user.lastName}`.trim();
  };

  const getInitials = () => {
    return `${user.firstName[0] || ""}${user.lastName[0] || ""}`.toUpperCase();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isVip = user.accountType === "VIP";

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account information and upgrade options
          </p>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.avatar} alt={getFullName()} />
                  <AvatarFallback className="text-lg">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">{getFullName()}</CardTitle>
                  <CardDescription className="text-base mt-1">
                    {user.email}
                  </CardDescription>
                </div>
              </div>
              <Badge
                variant={isVip ? "default" : "secondary"}
                className={
                  isVip
                    ? "bg-linear-to-r from-yellow-500 to-amber-500 text-white"
                    : ""
                }
              >
                {isVip ? (
                  <>
                    <Crown className="h-3 w-3 mr-1" />
                    VIP
                  </>
                ) : (
                  "STANDARD"
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Full Name</p>
                  <p className="text-sm text-muted-foreground">
                    {getFullName()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Member Since</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Sparkles className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Account Type</p>
                  <p className="text-sm text-muted-foreground">
                    {user.accountType}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upgrade Card */}
        {!isVip && (
          <Card className="border-yellow-500/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                <CardTitle>Upgrade to VIP</CardTitle>
              </div>
              <CardDescription>
                Unlock premium features and AI-powered analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">VIP Benefits:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>
                      Access to AI-powered sentiment analysis for news articles
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>
                      Advanced causal analysis for cryptocurrency trends
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Real-time AI insights on market movements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Priority access to new AI features</span>
                  </li>
                </ul>
              </div>
              <Button
                onClick={handleUpgrade}
                disabled={isUpgrading}
                className="w-full bg-linear-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600"
              >
                {isUpgrading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Upgrading...
                  </>
                ) : (
                  <>
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade to VIP
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* VIP Status Card */}
        {isVip && (
          <Card className="border-yellow-500/50 bg-linear-to-br from-yellow-50/50 to-amber-50/50 dark:from-yellow-950/20 dark:to-amber-950/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                <CardTitle>VIP Member</CardTitle>
              </div>
              <CardDescription>
                You have access to all premium features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Thank you for being a VIP member! You now have access to all
                AI-powered analysis features including sentiment analysis,
                causal analysis, and real-time AI insights.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
