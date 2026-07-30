import React, { useState } from 'react';

const SubscriptionPage: React.FC = () => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

    const tiers = [
        {
            name: 'Scholar',
            price: billingCycle === 'yearly' ? '0' : '0',
            desc: 'Essential tools for every student.',
            features: [
                'Unlimited AI Notes',
                'Basic Whiteboard',
                '500 AI Tokens / mo',
                'Standard Support',
            ],
            button: 'Current Plan',
            current: true,
            color: 'bg-slate-100 text-slate-600',
        },
        {
            name: 'Genius',
            price: billingCycle === 'yearly' ? '9.99' : '12.99',
            desc: 'Powerful AI for serious research.',
            features: [
                'GPT-4o Advanced Synthesis',
                'Collaborative Whiteboard',
                '5,000 AI Tokens / mo',
                'Priority AI Lab Access',
                'Cloud Backups',
            ],
            button: 'Upgrade to Genius',
            popular: true,
            color: 'bg-blue-600 text-white shadow-xl shadow-blue-200',
        },
        {
            name: 'Institution',
            price: 'Custom',
            desc: 'For teams and research labs.',
            features: [
                'Enterprise-grade Security',
                'Team Knowledge Vault',
                'Unlimited Tokens',
                'API Access',
                'Dedicated Account Manager',
            ],
            button: 'Contact Sales',
            color: 'bg-slate-900 text-white',
        }
    ];

    const handleUpgrade = async (name: string) => {
        if (name === 'Scholar') return;
        if (name === 'Institution') {
            window.location.href = 'mailto:support@notefusion.ai';
            return;
        }

        const variantId = import.meta.env.VITE_LEMON_SQUEEZY_VARIANT_ID;
        if (!variantId || variantId === 'your_variant_id_here') {
            alert("Payment system is being configured. Please check back later.");
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/billing/create-checkout?variant_id=${variantId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error("Failed to create checkout");
            
            const data = await response.json();
            window.location.href = data.checkout_url;
        } catch (error) {
            console.error(error);
            alert("Unable to start checkout. Please ensure you are logged in.");
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-16 animate-slide-up">
            {/* Header */}
            <div className="text-center mb-16">
                <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">
                    Elevate Your <span className="text-blue-600">Research</span>
                </h1>
                <p className="text-xl text-slate-400 font-medium mb-10 max-w-2xl mx-auto">
                    Choose the plan that fits your academic journey. Unlock superhuman note synthesis and unlimited collaborative tools.
                </p>

                {/* Toggle */}
                <div className="flex items-center justify-center gap-4">
                    <span className={`text-sm font-bold ${billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-400'}`}>Monthly</span>
                    <button 
                        onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                        className="w-14 h-8 bg-slate-200 rounded-full p-1 transition-all relative"
                    >
                        <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all ${billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                    <span className={`text-sm font-bold ${billingCycle === 'yearly' ? 'text-slate-900' : 'text-slate-400'}`}>
                        Yearly <span className="text-emerald-500 ml-1">Save 25%</span>
                    </span>
                </div>
            </div>

            {/* Pricing Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                {tiers.map((tier) => (
                    <div 
                        key={tier.name}
                        className={`relative p-10 rounded-[40px] border border-slate-100 bg-white transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-slate-200/50 flex flex-col ${tier.popular ? 'ring-4 ring-blue-50' : ''}`}
                    >
                        {tier.popular && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg">
                                Most Popular
                            </div>
                        )}

                        <div className="mb-8">
                            <h3 className="text-2xl font-black text-slate-900 mb-2">{tier.name}</h3>
                            <p className="text-sm text-slate-400 font-medium">{tier.desc}</p>
                        </div>

                        <div className="mb-10">
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black text-slate-900">${tier.price}</span>
                                {tier.price !== 'Custom' && (
                                    <span className="text-slate-400 font-bold text-sm">/mo</span>
                                )}
                            </div>
                            {billingCycle === 'yearly' && tier.price !== 'Custom' && tier.price !== '0' && (
                                <p className="text-emerald-500 text-xs font-bold mt-2">Billed annually</p>
                            )}
                        </div>

                        <div className="space-y-4 mb-10 flex-1">
                            {tier.features.map((feature) => (
                                <div key={feature} className="flex items-center gap-3">
                                    <div className="w-5 h-5 bg-emerald-50 rounded-full flex items-center justify-center text-[10px] text-emerald-600 font-black">✓</div>
                                    <span className="text-sm font-bold text-slate-600 tracking-tight">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <button 
                            onClick={() => handleUpgrade(tier.name)}
                            className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${tier.color} ${tier.current ? 'cursor-default' : 'hover:scale-[1.05] active:scale-95'}`}
                        >
                            {tier.button}
                        </button>
                    </div>
                ))}
            </div>

            {/* Footer FAQ style */}
            <div className="bg-slate-50 rounded-[48px] p-12 text-center border border-slate-100">
                <h3 className="text-2xl font-black text-slate-900 mb-4">Frequently Asked Questions</h3>
                <div className="grid md:grid-cols-2 gap-8 text-left max-w-4xl mx-auto mt-12">
                    <div>
                        <h4 className="font-black text-slate-800 mb-2">Can I cancel anytime?</h4>
                        <p className="text-sm text-slate-500 font-medium">Yes, you can cancel your subscription at any time from your settings page. You will retain access until the end of your billing cycle.</p>
                    </div>
                    <div>
                        <h4 className="font-black text-slate-800 mb-2">What are tokens?</h4>
                        <p className="text-sm text-slate-500 font-medium">Tokens power our advanced AI models like GPT-4o. Each synthesis or AI tutor query consumes a small amount of tokens.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPage;
