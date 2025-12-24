// src/pages/Patient/Payment.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Loader,
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Lock,
  Shield,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';

export default function Payment() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
  });
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Fetch appointment details
  useEffect(() => {
    const fetchAppointment = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/appointments/${appointmentId}`);
        setAppointment(res.data.appointment || res.data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to fetch appointment details');
      } finally {
        setLoading(false);
      }
    };

    if (appointmentId) fetchAppointment();
  }, [appointmentId]);

  // Format card number as XXXX XXXX XXXX XXXX
  const formatCardNumber = (value) => {
    const v = value.replace(/\D/g, '').slice(0, 16);
    return v.match(/.{1,4}/g)?.join(' ') || '';
  };

  // Format expiry as MM/YY
  const formatExpiry = (value) => {
    const v = value.replace(/\D/g, '').slice(0, 4);
    if (v.length >= 3) return v.slice(0, 2) + '/' + v.slice(2);
    return v;
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!appointment) return;

    const amount =
      appointment?.payment?.amount || appointment?.doctorId?.consultationFee || 0;

    if (amount <= 0) {
      toast.error('Invalid appointment fee.');
      return;
    }

    // Card validation
    if (paymentMethod === 'card') {
      const { number, name, expiry, cvv } = cardDetails;
      if (!number || !name || !expiry || !cvv) {
        toast.error('Please fill in all card details');
        return;
      }
      if (number.replace(/\s/g, '').length < 16) {
        toast.error('Invalid card number');
        return;
      }
      if (cvv.length < 3) {
        toast.error('Invalid CVV');
        return;
      }
    }

    setProcessing(true);
    try {
      // Fake payment API - this already updates appointment status to 'paid'
      const paymentRes = await api.post('/payments/fake-payment', {
        appointmentId,
        amount,
      });

      // Payment successful - status is already set to 'paid' by backend
      // Doctor will confirm the appointment later
      if (paymentRes.data?.appointmentStatus === 'paid') {
        setPaymentSuccess(true);
        setTimeout(() => navigate('/patient/dashboard'), 3000);
      } else {
        throw new Error('Payment completed but status not updated');
      }
    } catch (err) {
      console.error(err);
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Payment failed';
      toast.error(errorMsg);
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Sidebar />
        <div className="ml-64 pt-16 flex items-center justify-center min-h-screen">
          <Loader className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Sidebar />
        <div className="ml-64 pt-16 flex flex-col items-center justify-center min-h-screen">
          <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-gray-500 mb-4">Appointment not found</p>
          <button
            onClick={() => navigate('/patient/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const doctorName =
    typeof appointment.doctorId === 'object'
      ? appointment.doctorId.name
      : appointment.doctorId || 'Unknown Doctor';

  const amount =
    appointment?.payment?.amount || appointment?.doctorId?.consultationFee || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Sidebar />
      <div className="ml-64 pt-16 p-6 max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/patient/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {paymentSuccess ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Payment Successful!
            </h2>
            <p className="text-gray-600 mb-6">
              Your appointment has been confirmed. Redirecting to dashboard...
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-green-800">
                Appointment ID: {appointmentId}
              </p>
              <p className="text-sm text-green-800 mt-1">
                Amount Paid: ${amount}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Appointment Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Appointment Summary
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Doctor</p>
                      <p className="font-semibold text-gray-800">
                        {doctorName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-semibold text-gray-800">
                        {appointment.scheduledAt
                          ? new Date(appointment.scheduledAt).toLocaleDateString(
                              'en-US',
                              {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              }
                            )
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="font-semibold text-gray-800">
                        {appointment.scheduledAt
                          ? new Date(appointment.scheduledAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                  {appointment.symptoms && (
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-500 mb-1">Symptoms</p>
                      <p className="text-sm text-gray-700">
                        {appointment.symptoms}
                      </p>
                    </div>
                  )}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Consultation Fee</span>
                      <span className="font-semibold text-gray-800">
                        ${amount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-lg font-bold text-gray-800 pt-2 border-t border-gray-200">
                      <span>Total</span>
                      <span>${amount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Lock className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-800">
                    Secure Payment
                  </h2>
                </div>

                <div className="flex items-center gap-2 mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <p className="text-sm text-blue-800">
                    Your payment is secured with 256-bit SSL encryption
                  </p>
                </div>

                {/* Payment Method */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`px-4 py-3 rounded-lg border-2 transition flex items-center justify-center gap-2 ${
                        paymentMethod === 'card'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <CreditCard className="w-5 h-5" />
                      Credit/Debit Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('wallet')}
                      className={`px-4 py-3 rounded-lg border-2 transition ${
                        paymentMethod === 'wallet'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      Digital Wallet
                    </button>
                  </div>
                </div>

                <form onSubmit={handlePayment} className="space-y-6">
                  {paymentMethod === 'card' && (
                    <>
                      {/* Card Number */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Card Number
                        </label>
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          value={cardDetails.number}
                          onChange={(e) =>
                            setCardDetails({
                              ...cardDetails,
                              number: formatCardNumber(e.target.value),
                            })
                          }
                          maxLength={19}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>

                      {/* Cardholder Name */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          placeholder="John Doe"
                          value={cardDetails.name}
                          onChange={(e) =>
                            setCardDetails({
                              ...cardDetails,
                              name: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>

                      {/* Expiry and CVV */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            value={cardDetails.expiry}
                            onChange={(e) =>
                              setCardDetails({
                                ...cardDetails,
                                expiry: formatExpiry(e.target.value),
                              })
                            }
                            maxLength={5}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            CVV
                          </label>
                          <input
                            type="text"
                            placeholder="123"
                            value={cardDetails.cvv}
                            onChange={(e) =>
                              setCardDetails({
                                ...cardDetails,
                                cvv: e.target.value
                                  .replace(/\D/g, '')
                                  .slice(0, 4),
                              })
                            }
                            maxLength={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {paymentMethod === 'wallet' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800">
                        Digital wallet payment will be processed through your
                        selected wallet provider.
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        Pay ${amount}
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
