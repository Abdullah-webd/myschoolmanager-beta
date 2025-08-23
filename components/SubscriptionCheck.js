'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CreditCard } from 'lucide-react';

export default function SubscriptionCheck({ children }) {
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/');
        return;
      }

      const response = await fetch('http://localhost:3001/api/payments/subscription', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSubscriptionStatus(data.subscription);
        
        if (!data.subscription.isActive) {
          setShowExpiredModal(true);
        }
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Subscription check failed:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentRedirect = () => {
    router.push('/payment');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (showExpiredModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-md mx-4 text-center">
          <div className="bg-red-100 p-4 rounded-full inline-block mb-6">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Subscription Expired
          </h2>
          
          <p className="text-gray-600 mb-6">
            Your subscription has expired. Please renew your plan to continue using the school management system.
          </p>
          
          {subscriptionStatus?.expiryDate && (
            <p className="text-sm text-gray-500 mb-6">
              Expired on: {new Date(subscriptionStatus.expiryDate).toLocaleDateString()}
            </p>
          )}
          
          <button
            onClick={handlePaymentRedirect}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <CreditCard className="h-5 w-5" />
            <span>Renew Subscription</span>
          </button>
        </div>
      </div>
    );
  }

  if (!subscriptionStatus?.isActive) {
    return null;
  }

  return children;
}