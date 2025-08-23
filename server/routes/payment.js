const express = require('express');
const axios = require('axios');
const School = require('../models/School');
const { auth } = require('../middleware/auth');

const router = express.Router();

const FLUTTERWAVE_SECRET_KEY = 'FLWSECK_TEST-769e9db540aef513a9973427f66f4daf-X';
const FLUTTERWAVE_PUBLIC_KEY = 'FLWSECK_TEST-769e9db540aef513a9973427f66f4daf-X';

// Payment plans
const PAYMENT_PLANS = {
  monthly: {
    amount: 15000,
    duration: 30, // days
    name: 'Monthly Plan'
  },
  yearly: {
    amount: 150000,
    duration: 365, // days
    name: 'Yearly Plan'
  }
};

// Get payment plans
router.get('/plans', (req, res) => {
  res.json({
    plans: PAYMENT_PLANS,
    flutterwavePublicKey: FLUTTERWAVE_PUBLIC_KEY
  });
});

// Initialize payment
router.post('/initialize', auth, async (req, res) => {
  try {
    const { planType } = req.body;
    console.log('Initializing payment for plan:', planType);

    if (!PAYMENT_PLANS[planType]) {
      return res.status(400).json({ message: 'Invalid plan type' });
    }

    const school = await School.findOne({ admin: req.user.id });
    if (!school) {
      return res.status(404).json({ message: 'School not found for this admin' });
    }

    const plan = PAYMENT_PLANS[planType];

    const paymentData = {
      tx_ref: `${school._id}_${Date.now()}`,
      amount: plan.amount,
      currency: 'NGN',
      redirect_url: `http://localhost:3000/payment`,
      customer: {
        email: school.email,
        name: school.name,
        phonenumber: school.phone || ''
      },
      customizations: {
        title: 'EduPortal Subscription',
        description: `${plan.name} - School Management System`,
        logo: `${process.env.FRONTEND_URL}/logo.png`
      },
      meta: {
        schoolId: school._id.toString(),
        planType
      }
    };

    // Call Flutterwave API
    const response = await axios.post(
      'https://api.flutterwave.com/v3/payments',
      paymentData,
      {
        headers: {
          Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Payment initialization response:', response);
    res.json(response.data);
  } catch (error) {
    console.error('Payment initialization error:', error.errors || error.message);
    res.status(500).json({ message: 'Payment initialization failed' });
  }
});

// Verify payment
router.post('/verify', auth, async (req, res) => {
  try {
    const { tx_ref } = req.body;
    console.log('Verifying payment for transaction reference:', tx_ref);

    if (!tx_ref) {
      return res.status(400).json({ error: 'Missing tx_ref in query' });
    }

    // 🔍 Call Flutterwave verify_by_reference endpoint
    const response = await axios.get(
      `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${tx_ref}`,
      {
        headers: {
          Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
        },
      }
    );

    const verification = response.data?.data;

    if (!verification) {
      return res.status(400).json({ 
        status: 'pending',
        message: 'Payment not found or still pending' 
      });
    }

    if (verification.status === 'successful') {
      // Extract meta info you passed when initializing payment
      const { planType, schoolId } = verification.meta || {};
      const plan = PAYMENT_PLANS[planType];

      if (!plan) {
        return res.status(400).json({ message: 'Invalid plan type' });
      }

      const school = await School.findById(schoolId);
      if (!school) {
        return res.status(404).json({ message: 'School not found' });
      }

      // Update subscription
      const startDate = new Date();
      const expiryDate = new Date();
      expiryDate.setDate(startDate.getDate() + plan.duration);

      school.subscription = {
        planType,
        startDate,
        expiryDate,
        isActive: true,
        flutterwaveReference: verification.tx_ref,
        lastPaymentDate: startDate,
      };

      await school.save();

      return res.json({
        status: 'success',
        message: 'Payment verified successfully',
        subscription: school.subscription,
        flutterwave: verification,
      });
    } else {
      return res.status(400).json({ 
        status: verification.status,
        message: 'Payment verification failed',
        flutterwave: verification,
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error?.response?.data || error.message);
    res.status(500).json({ 
      status: 'error',
      message: 'Server error during payment verification',
      details: error?.response?.data || error.message,
    });
  }
});

// Get school subscription status
router.get('/subscription', auth, async (req, res) => {
  try {
    const school = await School.findOne({ admin: req.user.id });
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    school.checkSubscriptionStatus();
    await school.save();

    res.json({
      subscription: school.subscription,
      plans: PAYMENT_PLANS
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
