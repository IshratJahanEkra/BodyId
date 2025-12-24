import Stripe from 'stripe';
import Appointment from '../models/Appointment.js';
import Payment from '../models/Payment.js';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create payment intent
export async function createPaymentIntent(req, res) {
  try {
    const { appointmentId, amount } = req.body;

    if (!appointmentId || !amount) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Verify the appointment belongs to the authenticated user
    if (appointment.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'You can only create payment for your own appointments' 
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // in cents
      currency: 'usd',
      metadata: { appointmentId: appointment._id.toString() },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Payment error', error: err.message });
  }
}

export async function stripeWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const appointmentId = paymentIntent.metadata.appointmentId;

    const appointment = await Appointment.findById(appointmentId);
    if (appointment) {
      appointment.payment.paid = true;
      appointment.payment.paymentId = paymentIntent.id;
      appointment.payment.amount = paymentIntent.amount / 100;
      appointment.status = 'paid';
      await appointment.save();
    }
  }

  res.json({ received: true });
}

export async function fakePayment(req, res) {
  try {
    const { appointmentId, amount } = req.body;
    
    if (!appointmentId || !amount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    // Find appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Verify the appointment belongs to the authenticated user
    if (appointment.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'You can only make payment for your own appointments' 
      });
    }

    // Check if appointment is already paid
    if (appointment.status === 'paid' || appointment.payment.paid) {
      return res.status(400).json({ 
        message: 'Appointment is already paid' 
      });
    }

    // Create Fake Payment
    const payment = await Payment.create({
      appointmentId,
      patientId: req.user._id,
      doctorId: appointment.doctorId,
      amount,
      provider: 'fake',
      transactionId: 'FAKE-' + Date.now(),
      paid: true,
      status: 'success',
    });

    // Update appointment status: pending → paid
    appointment.status = 'paid';
    appointment.payment.paid = true;
    appointment.payment.amount = amount;
    appointment.payment.provider = 'fake';
    appointment.payment.paymentId = payment.transactionId;

    await appointment.save();

    res.json({
      message: 'Fake payment successful',
      appointmentStatus: appointment.status,
      payment,
    });
  } catch (error) {
    console.error('Fake Payment Error:', error);
    res.status(500).json({
      message: 'Payment failed',
      error: error.message,
    });
  }
}
