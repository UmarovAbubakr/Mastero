'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Zap, Crown, Star, ArrowRight } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const PricingPage = () => {
  const t = useTranslations('Pricing');
  const [loading, setLoading] = useState<string | null>(null);
  const [currentTier, setCurrentTier] = useState<string>('FREE');

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await axios.get(`${BACKEND_URL}/subscriptions/status`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentTier(res.data.subscriptionTier);
      } catch (err) {
        console.error('Failed to fetch subscription status');
      }
    };
    fetchStatus();
  }, []);

  const handleUpgrade = async (tier: string) => {
    setLoading(tier);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      const res = await axios.post(
        `${BACKEND_URL}/subscriptions/checkout`,
        { tier },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to initiate checkout');
    } finally {
      setLoading(null);
    }
  };

  const tiers = [
    {
      id: 'FREE',
      name: 'Free',
      price: '$0',
      description: 'Standard visibility for beginners',
      features: [
        '1 Portfolio Item',
        'Standard Search Rank',
        'Standard Profile Badge',
        'Standard Support'
      ],
      icon: <Star className="w-6 h-6 text-slate-400" />,
      color: 'bg-slate-500',
      buttonVariant: 'outline' as const,
    },
    {
      id: 'PRO',
      name: 'Pro',
      price: '$10',
      period: '/month',
      description: 'For growing professionals',
      features: [
        '10 Portfolio Items',
        'Higher Search Rank',
        'Verified PRO Badge',
        'Featured in Search',
        'Priority Support'
      ],
      icon: <Zap className="w-6 h-6 text-amber-500" />,
      color: 'bg-amber-500',
      buttonVariant: 'default' as const,
      popular: true,
    },
    {
      id: 'ULTRA',
      name: 'Ultra',
      price: '$25',
      period: '/month',
      description: 'The ultimate professional plan',
      features: [
        'Unlimited Portfolio Items',
        'Top Search Rank',
        'VIP ULTRA Badge',
        'Priority in Feed',
        'Personal Manager',
        '0% Service Fee'
      ],
      icon: <Crown className="w-6 h-6 text-purple-600" />,
      color: 'bg-purple-600',
      buttonVariant: 'default' as const,
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 px-4 py-1">
            {t('title')}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            {t('mainTitle').split('Mastero Premium')[0]} <span className="text-indigo-600">Mastero Premium</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <Card 
              key={tier.id} 
              className={`relative overflow-hidden border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                tier.popular 
                  ? 'border-indigo-600 dark:border-indigo-500 scale-105 z-10' 
                  : 'border-transparent'
              }`}
            >
              {tier.popular && (
                <div className="absolute top-0 right-0">
                  <div className="bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest py-1 px-10 rotate-45 translate-x-1/3 -translate-y-1/2 mt-10">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-3 rounded-2xl ${tier.color} bg-opacity-10`}>
                    {tier.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{tier.name}</h3>
                    <p className="text-sm text-slate-500">{tier.description}</p>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-extrabold text-slate-900 dark:text-white">{tier.price}</span>
                    <span className="text-slate-500 ml-1">{tier.period}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className={`w-full h-12 text-md font-semibold group ${
                    tier.popular ? 'bg-indigo-600 hover:bg-indigo-700' : ''
                  }`}
                  variant={tier.buttonVariant}
                  onClick={() => handleUpgrade(tier.id)}
                  disabled={loading !== null || currentTier === tier.id}
                >
                  {loading === tier.id ? (
                    t('processing')
                  ) : currentTier === tier.id ? (
                    t('currentPlan')
                  ) : (
                    <>
                      {tier.id === 'FREE' ? t('currentPlan') : t('upgradeNow')}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </div>

              {/* Decorative background element */}
              <div className={`absolute -bottom-24 -right-24 w-48 h-48 rounded-full ${tier.color} opacity-5 blur-3xl`} />
            </Card>
          ))}
        </div>

        <div className="mt-20 text-center">
          <p className="text-slate-500 dark:text-slate-400">
            Have questions? <a href="#" className="text-indigo-600 font-semibold underline underline-offset-4">Contact our support team</a>
          </p>
          <div className="mt-8 flex justify-center items-center gap-8 grayscale opacity-50">
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-8" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-6" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-8" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
