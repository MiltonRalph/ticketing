import { useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../../lib/stripe-client';
import CheckoutForm from '../../components/checkout-form';

const OrderShow = ({ order }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };

    calculateTimeLeft();
    const timerId = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timerId);
  }, []);

  if (timeLeft < 0) {
    return <h2>Order Expired</h2>;
  }

  return (
    <div>
      <div>{timeLeft} seconds until order expires</div>
      <Elements stripe={stripePromise}>
        <CheckoutForm order={order} />
      </Elements>
    </div>
  );
};

OrderShow.getInitialProps = async (useContext, client) => {
  const { orderId } = useContext.query;
  const { data } = await client.get(`/api/orders/${orderId}`);
  return { order: data };
};

export default OrderShow;