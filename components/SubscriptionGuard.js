import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SubscriptionGuard({ children }) {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "http://localhost:3001/api/payments/subscription",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setSubscription(data.subscription);
        }
      } catch (error) {
        setSubscription(null);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscription();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const isExpired =
    !subscription?.isActive ||
    (subscription?.expiryDate &&
      new Date(subscription.expiryDate) < new Date());

  if (isExpired) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50">
        <div className="bg-white p-8 rounded-xl shadow border border-red-200 text-center">
          <h2 className="text-2xl font-bold text-red-700 mb-4">
            Your subscription has expired. Please renew to continue.
          </h2>
          <button
            className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
            onClick={() => router.push("/payment")}
          >
            Renew Plan
          </button>
        </div>
      </div>
    );
  }

  return children;
}
