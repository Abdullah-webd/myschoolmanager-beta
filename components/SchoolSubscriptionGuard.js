import { useState, useEffect } from "react";

export default function SchoolSubscriptionGuard({ children }) {
  const [expired, setExpired] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminId = localStorage.getItem("adminId");
    if (!adminId) {
      setLoading(false);
      setExpired(false);
      return;
    }
    fetch(
      `http://localhost:3001/api/payments/school-subscription?adminId=${adminId}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.subscription && !data.subscription.isActive) {
          setExpired(true);
        } else {
            console.log("School subscription is active:", data.subscription);
          setExpired(false);
        }
      })
      .catch(() => setExpired(false))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Checking subscription...
      </div>
    );
  }

  if (expired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="bg-white p-8 rounded-xl shadow border border-red-200 text-center">
          <h2 className="text-2xl font-bold text-red-700 mb-4">
            Your school’s subscription has expired. Please contact your school
            admin for help.
          </h2>
        </div>
      </div>
    );
  }

  return children;
}
