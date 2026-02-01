import AIPriceChatbox from "@/components/chat/ai-price-chatbox";

export const metadata = {
  title: "AI Price Prediction | Crypto Platform",
  description:
    "AI-powered cryptocurrency price predictions based on news sentiment analysis",
};

export default function PricePredictionPage() {
  return (
    <div className="min-h-screen bg-background">
      <AIPriceChatbox />
    </div>
  );
}
