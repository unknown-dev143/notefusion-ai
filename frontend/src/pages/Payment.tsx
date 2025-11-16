import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PaymentModal from '../components/PaymentModal';
import toast from 'react-hot-toast';

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  popular?: boolean;
}

const Payment: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFreeMode] = useState(true); // All features are free

  const plans: Plan[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: 999, // $9.99
      features: [
        '5 Whiteboards',
        'Basic shapes and tools',
        'Local storage only',
        'Standard support'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 1999, // $19.99
      popular: true,
      features: [
        'Unlimited Whiteboards',
        'All drawing tools',
        'Cloud sync (Firebase)',
        'Google Drive integration',
        'Export to PDF',
        'Priority support',
        'Collaboration features'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 4999, // $49.99
      features: [
        'Everything in Pro',
        'Team collaboration',
        'Advanced analytics',
        'Custom integrations',
        'Dedicated support',
        'API access',
        'White-label options'
      ]
    }
  ];

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    toast.success('Payment successful! Your account has been upgraded.');
    // Update user subscription status
    localStorage.setItem('subscription', selectedPlan?.id || '');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <div className="mb-4 inline-block px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full text-lg font-semibold animate-pulse">
          🎉 All Features Are Free!
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">NoteFusion AI - Free & Open</h1>
        <p className="text-xl text-gray-600">All premium features are now accessible to everyone worldwide</p>
      </div>

      {/* Free Access Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">✨ Everything is Free!</h2>
        <p className="text-gray-700 mb-4">
          We believe in making powerful tools accessible to everyone. All features including whiteboard, 
          AI note generation, cloud sync, and Google Drive integration are completely free.
        </p>
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-3xl mb-2">🎨</div>
            <h3 className="font-semibold">Full Whiteboard</h3>
            <p className="text-sm text-gray-600">All drawing tools & features</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-3xl mb-2">🤖</div>
            <h3 className="font-semibold">AI Features</h3>
            <p className="text-sm text-gray-600">Unlimited AI note generation</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-3xl mb-2">☁️</div>
            <h3 className="font-semibold">Cloud Sync</h3>
            <p className="text-sm text-gray-600">Firebase & Google Drive</p>
          </div>
        </div>
      </div>

      {/* Optional: Show plans for reference (but everything is free) */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-green-500">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">All Features Included</h2>
            <p className="text-2xl text-green-600 font-semibold">100% Free Forever</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-3 text-gray-800">🎨 Whiteboard Features</h3>
              <ul className="space-y-2 text-gray-700">
                <li>✓ All drawing tools (Pen, Shapes, Text)</li>
                <li>✓ Undo/Redo functionality</li>
                <li>✓ Multiple colors & line widths</li>
                <li>✓ Export to PNG & PDF</li>
                <li>✓ Real-time collaboration</li>
                <li>✓ Cloud sync with Firebase</li>
                <li>✓ Google Drive integration</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-3 text-gray-800">🤖 AI Features</h3>
              <ul className="space-y-2 text-gray-700">
                <li>✓ File upload & transcription</li>
                <li>✓ AI note generation</li>
                <li>✓ Multiple detail levels</li>
                <li>✓ Practice questions</li>
                <li>✓ Export to PDF/Markdown</li>
                <li>✓ AI model selection</li>
                <li>✓ Custom AI settings</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/dashboard"
              className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
            >
              Start Using All Features Now →
            </Link>
          </div>
        </div>
      </div>

      {selectedPlan && (
        <PaymentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          amount={selectedPlan.price}
          planName={selectedPlan.name}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default Payment;

