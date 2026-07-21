import { useState } from 'react';
import Router from 'next/router';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import useRequest from '../hooks/use-request';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: { fontSize: '16px', color: '#32325d', '::placeholder': { color: '#aab7c4' } },
    invalid: { color: '#fa755a' },
  },
};

const CheckoutForm = ({ order }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { doRequest, errors } = useRequest({
    url: '/api/payments',
    method: 'post',
    body: { orderId: order.id },
    onSuccess: () => Router.push('/orders'),
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    const { token, error } = await stripe.createToken(elements.getElement(CardElement));

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    doRequest({ token: token.id });
  };

  return (
    <>
      <button className="btn btn-primary" onClick={() => setShowModal(true)}>
        Purchase for ${order.ticket?.price}
      </button>

      {showModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h3>Complete your payment</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ padding: '12px', border: '1px solid #ccc', borderRadius: '4px', margin: '16px 0' }}>
                <CardElement options={CARD_ELEMENT_OPTIONS} />
              </div>
              {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
              {errors}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={!stripe}>
                  Pay ${order.ticket?.price}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

const overlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(0,0,0,0.5)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000,
};

const modalStyle = {
  background: 'white', padding: '24px', borderRadius: '8px',
  width: '400px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
};

export default CheckoutForm;