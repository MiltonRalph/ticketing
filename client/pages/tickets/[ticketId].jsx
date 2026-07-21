import Router from 'next/router';
import useRequest from '../../hooks/use-request';

const TicketShow = ({ ticket }) => {
  const { doRequest, errors } = useRequest({
    url: '/api/orders',
    method: 'post',
    body: { ticketId: ticket.id },
    onSuccess: (order) => Router.push(`/orders/${order.id}`),
  });
  return (
    <div>
      <h1>{ticket.title}</h1>
      <h4>${ticket.price}</h4>
      {errors}
      <button onClick={() => doRequest()} className='btn btn-primary'>
        Purchase
      </button>
    </div>
  );
};

TicketShow.getInitialProps = async (useContext, client) => {
  const { ticketId } = useContext.query; // This means take the ticketId we specified as the route page '[ticketId].jsx' which we passed as a query

  const { data } = await client.get(`api/tickets/${ticketId}`);

  return { ticket: data };
};

export default TicketShow;
