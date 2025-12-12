"use client";

import { NewsFeed } from "@/components/pages/news/NewsFeed";
import { MOCK_NEWS } from "@/lib/constants/news";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NewsList() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Crypto News & Sentiment</CardTitle>
          <CardDescription>
            Latest cryptocurrency news with AI-powered sentiment analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewsFeed articles={MOCK_NEWS} />
        </CardContent>
      </Card>
    </div>
  );
}
