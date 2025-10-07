import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    const { priceId, planType } = await req.json();

    if (!priceId || !planType) {
      throw new Error('Missing priceId or planType');
    }

    console.log(`[Checkout] Creating session for user ${user.id}, plan: ${planType}`);

    // Buscar user_id do public.users
    const { data: userData } = await supabaseClient
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single();

    if (!userData) {
      throw new Error('User not found in database');
    }

    // Verificar se já tem customer_id
    const { data: existingSubscription } = await supabaseClient
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userData.id)
      .single();

    let customerId = existingSubscription?.stripe_customer_id;

    // Criar customer se não existir
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: userData.id.toString(),
        },
      });
      customerId = customer.id;
      console.log(`[Customer Created] ${customerId}`);
    }

    const origin = req.headers.get('origin') || 'https://vixjenbmutjvlcmmrwdj.supabase.co';

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/pricing?success=true`,
      cancel_url: `${origin}/pricing?canceled=true`,
      client_reference_id: userData.id.toString(),
      subscription_data: {
        metadata: {
          user_id: userData.id.toString(),
          plan_type: planType,
        },
      },
    });

    console.log(`[Checkout Session Created] ${session.id}`);

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (err) {
    console.error(`[Checkout Error] ${err.message}`);
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
