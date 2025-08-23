'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, CreditCard, Calendar, Users, Shield } from 'lucide-react';

export default function PaymentPage() {
  const [plans, setPlans] = useState({});
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [loading, setLoading] = useState(false); // for payment button
  const [checking, setChecking] = useState(true); // 🔹 new: for initial fetch
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [notification, setNotification] = useState(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const init = async () => {
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      if (!userData || !token) {
        router.push('/');
        return;
      }

      setUser(JSON.parse(userData));

      // check if Flutterwave redirected back
      const status = searchParams.get('status');
      const txRef = searchParams.get('tx_ref');

      if (status && txRef) {
        await handleVerification(status, txRef);
      } else {
        await fetchPlans();
        await fetchSubscription();
      }

      setChecking(false); // 🔹 end initial check
    };

    init();
  }, [router, searchParams]);

  const handleVerification = async (status, txRef) => {
    setVerifying(true);

    if (status === 'successful') {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:3001/api/payments/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ tx_ref: txRef }),
        });

        const data = await res.json();
        if (data.status === 'success') {
          setNotification({ type: 'success', message: '✅ Payment Confirmed! Thank you.' });
          await fetchSubscription();
        } else {
          setNotification({ type: 'error', message: '❌ Payment verification failed, please try again.' });
          await fetchPlans();
        }
      } catch (err) {
        console.error(err);
        setNotification({ type: 'error', message: '⚠️ Error verifying payment. Try again.' });
        await fetchPlans();
      } finally {
        setVerifying(false);
      }
    } else if (status === 'cancelled') {
      setNotification({ type: 'warning', message: '🚫 Payment Cancelled.' });
      setVerifying(false);
      await fetchPlans();
    } else {
      setNotification({ type: 'error', message: '❌ Payment Failed. Please try again.' });
      setVerifying(false);
      await fetchPlans();
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/payments/plans');
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans);
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    }
  };

  const fetchSubscription = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/payments/subscription', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    }
  };

  const handlePayment = async () => {
    if (!user) return;

    if (subscription?.isActive) {
      alert(`You already have an active ${subscription.planType} plan until ${new Date(subscription.expiryDate).toDateString()}`);
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/payments/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ planType: selectedPlan }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.data?.link) {
          window.location.href = data.data.link;
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Checking your subscription...</p>
        </div>
      </div>
    );
  }

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Confirming your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">

          {/* 🔹 Notification Banner */}
          {notification && (
            <div
              className={`mb-6 p-4 rounded-lg text-center font-semibold ${
                notification.type === 'success'
                  ? 'bg-green-100 text-green-800'
                  : notification.type === 'error'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {notification.message}
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {subscription?.isActive
                ? "Your Current Subscription"
                : "Choose Your Plan"}
            </h1>
            {subscription?.isActive ? (
              <p className="text-lg text-gray-700">
                You are on the <b>{subscription.planType}</b> plan until{" "}
                {new Date(subscription.expiryDate).toDateString()}
              </p>
            ) : (
              <p className="text-xl text-gray-600">
                Select the perfect plan for your school
              </p>
            )}
          </div>

          {/* Pricing Cards */}
          {!subscription?.isActive && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {Object.entries(plans).map(([key, plan]) => (
                <div
                  key={key}
                  onClick={() => setSelectedPlan(key)}
                  className={`relative p-8 rounded-2xl cursor-pointer transition-all transform hover:scale-105 ${
                    selectedPlan === key
                      ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-2xl'
                      : 'bg-white text-gray-900 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {key === 'yearly' && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
                    <div className="mb-6">
                      <span className="text-5xl font-bold">₦{plan.amount.toLocaleString()}</span>
                      <span className="text-lg opacity-75">/{key}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-3 text-green-500" />
                      <span>Unlimited Students & Teachers</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-3 text-green-500" />
                      <span>AI-Powered Exam Creation</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-3 text-green-500" />
                      <span>Assignment Management</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-3 text-green-500" />
                      <span>Course Material Upload</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-3 text-green-500" />
                      <span>Bulk Messaging System</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-3 text-green-500" />
                      <span>24/7 Support</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Payment Button */}
          {!subscription?.isActive && (
            <div className="text-center">
              <button
                onClick={handlePayment}
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 mx-auto"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    <span>Pay with Flutterwave</span>
                  </>
                )}
              </button>
              
              <p className="text-sm text-gray-600 mt-4">
                Secure payment powered by Flutterwave
              </p>
            </div>
          )}

          {/* Features Section */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 p-4 rounded-full inline-block mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">User Management</h3>
              <p className="text-gray-600">Easily manage teachers and students with automated account creation</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 p-4 rounded-full inline-block mb-4">
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Exam Scheduling</h3>
              <p className="text-gray-600">Schedule exams with automatic timers and AI-generated questions</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 p-4 rounded-full inline-block mb-4">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure & Reliable</h3>
              <p className="text-gray-600">Bank-level security with reliable cloud infrastructure</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
