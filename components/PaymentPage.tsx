import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { supabase } from '../supabaseClient';

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string);

const CheckoutForm = ({ documentId }: { documentId: string }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // *** FIX: Updated for HashRouter ***
        return_url: `${window.location.origin}/#/payment-success?document_id=${documentId}`,
      },
    });

    // This point will only be reached if there is an immediate error.
    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message || 'An unexpected error occurred.');
    } else {
      setMessage("An unexpected error occurred.");
    }

    setIsLoading(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" />
      <button disabled={isLoading || !stripe || !elements} id="submit" className="w-full mt-6 p-3 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 transition-colors disabled:bg-primary-300">
        <span id="button-text">
          {isLoading ? <div className="spinner" id="spinner"></div> : "Pay now"}
        </span>
      </button>
      {message && <div id="payment-message" className="mt-4 text-center text-sm text-red-500">{message}</div>}
    </form>
  );
};

const PaymentPage: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    if (!documentId) return;

    const createPaymentIntent = async () => {
      try {
        // ***
        // *** FIX: Call the Vercel function, not Supabase function
        // ***
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ documentId }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to create payment intent');
        }
        
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        }
      } catch (error: any) {
        console.error("Error creating payment intent:", error.message);
        // Handle error display for the user
      }
    };

    createPaymentIntent();
  }, [documentId]);

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: { theme: 'stripe' },
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Pay Invoice</h1>
        {clientSecret && (
          <Elements options={options} stripe={stripePromise}>
            <CheckoutForm documentId={documentId!} />
          </Elements>
        )}
        {!clientSecret && (
          <div className="text-center text-slate-500">Loading payment form...</div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;