import { type FormEvent, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import './checkout.css';

export type CheckoutItem = { id: string; name: string; quantity: number; unitPrice: number };
export type OrderReceipt = { id: string; status: string; paymentMethod: string; total: number; currency: string; recipientName: string; items: { productName: string; quantity: number; lineTotal: number }[] };
type ShippingAddress = { recipientName: string; phone: string; addressLine1: string; addressLine2: string; city: string; state: string; postalCode: string };

type CheckoutProps = {
  api: string;
  items: CheckoutItem[];
  onClose: () => void;
  onPlaced: (receipt: OrderReceipt) => void;
  onUnauthorized: () => void;
};

const money = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

export function CheckoutPanel({ api, items, onClose, onPlaced, onUnauthorized }: CheckoutProps) {
  const [checkoutId] = useState(() => crypto.randomUUID());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [savedDetails, setSavedDetails] = useState<ShippingAddress | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [editingDetails, setEditingDetails] = useState(false);
  const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  useEffect(() => {
    const token = localStorage.getItem('commerce.token');
    if (!token) { onUnauthorized(); return; }
    const controller = new AbortController();
    fetch(`${api}/api/v1/orders/checkout-details`, {
      headers: { Authorization: `Bearer ${token}` }, signal: controller.signal
    }).then(async response => {
      if (response.status === 401) { onUnauthorized(); return; }
      if (!response.ok) throw new Error(`Could not load saved delivery details (${response.status})`);
      if (response.status === 200) setSavedDetails(await response.json());
    }).catch(cause => {
      if (cause.name !== 'AbortError') setError(cause instanceof Error ? cause.message : 'Could not load saved delivery details.');
    }).finally(() => { if (!controller.signal.aborted) setLoadingDetails(false); });
    return () => controller.abort();
  }, [api, onUnauthorized]);

  const placeOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError('');
    const fields = new FormData(event.currentTarget);
    const token = localStorage.getItem('commerce.token');
    if (!token) { onUnauthorized(); return; }
    const shippingAddress = savedDetails && !editingDetails ? null : Object.fromEntries(
      ['recipientName', 'phone', 'addressLine1', 'addressLine2', 'city', 'state', 'postalCode']
        .map(name => [name, String(fields.get(name) ?? '').trim()]));
    try {
      const response = await fetch(`${api}/api/v1/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ checkoutId, items: items.map(item => ({ productId: item.id, quantity: item.quantity })), shippingAddress })
      });
      if (response.status === 401) { onUnauthorized(); return; }
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.detail ?? body?.message ?? `Could not place order (${response.status})`);
      }
      onPlaced(await response.json());
    } catch (cause) {
      setError(cause instanceof TypeError ? 'Cannot reach checkout. Check that the gateway and user service are running.' : cause instanceof Error ? cause.message : 'Could not place order.');
    } finally { setSubmitting(false); }
  };

  return <div className="modal-backdrop" role="presentation" onClick={onClose}><section className="modal checkout-panel" role="dialog" aria-modal="true" aria-label="Checkout" onClick={event => event.stopPropagation()}><button className="close" onClick={onClose} aria-label="Close checkout"><X /></button><p className="eyebrow">CHECKOUT</p><h2>Delivery details</h2><p className="checkout-intro">Review your order and delivery address.</p>
    {loadingDetails ? <p role="status">Loading delivery details…</p> : <form onSubmit={placeOrder}>
    {savedDetails && !editingDetails ? <div className="saved-details"><strong>Saved delivery details</strong><p>{savedDetails.recipientName} · {savedDetails.phone}<br />{savedDetails.addressLine1}{savedDetails.addressLine2 && `, ${savedDetails.addressLine2}`}<br />{savedDetails.city}, {savedDetails.state} {savedDetails.postalCode}</p><button type="button" className="switch" onClick={() => setEditingDetails(true)}>Edit delivery details</button></div> : <>
    <label>Full name<input name="recipientName" autoComplete="name" maxLength={120} defaultValue={savedDetails?.recipientName} required /></label>
    <label>Phone number<input name="phone" type="tel" autoComplete="tel" minLength={7} maxLength={32} defaultValue={savedDetails?.phone} required /></label>
    <label>Address line 1<input name="addressLine1" autoComplete="address-line1" maxLength={200} defaultValue={savedDetails?.addressLine1} required /></label>
    <label>Address line 2 (optional)<input name="addressLine2" autoComplete="address-line2" maxLength={200} defaultValue={savedDetails?.addressLine2} /></label>
    <div className="two"><label>City<input name="city" autoComplete="address-level2" maxLength={100} defaultValue={savedDetails?.city} required /></label><label>State<input name="state" autoComplete="address-level1" maxLength={100} defaultValue={savedDetails?.state} required /></label></div>
    <label>Postal code<input name="postalCode" autoComplete="postal-code" maxLength={20} defaultValue={savedDetails?.postalCode} required /></label>
    {savedDetails && <button type="button" className="switch" onClick={() => setEditingDetails(false)}>Use saved details</button>}
    </>}
    <div className="checkout-summary"><h3>Order summary</h3>{items.map(item => <div key={item.id}><span>{item.name} × {item.quantity}</span><strong>{money(item.unitPrice * item.quantity)}</strong></div>)}<div className="checkout-total"><span>Total</span><strong>{money(total)}</strong></div></div>
    <p className="checkout-payment">Demo checkout: cash on delivery is selected, but no delivery or payment is arranged.</p>
    {error && <p className="form-message" role="alert">{error}</p>}
    <button className="primary" type="submit" disabled={submitting}>{submitting ? 'Placing order…' : `Place order · ${money(total)}`}</button>
  </form>}</section></div>;
}

export function OrderConfirmation({ receipt, onClose }: { receipt: OrderReceipt; onClose: () => void }) {
  return <div className="modal-backdrop" role="presentation"><section className="modal checkout-panel" role="dialog" aria-modal="true" aria-label="Order confirmation"><button className="close" onClick={onClose} aria-label="Close order confirmation"><X /></button><p className="eyebrow">ORDER SAVED</p><h2>Thank you, {receipt.recipientName}.</h2><p>Your demo order was saved. Delivery is not scheduled. Keep this order ID for your records.</p><code className="order-id">{receipt.id}</code><div className="checkout-summary"><div><span>Status</span><strong>{receipt.status}</strong></div><div><span>Payment method</span><strong>Cash on delivery</strong></div><div className="checkout-total"><span>Order total</span><strong>{money(receipt.total)}</strong></div></div><button className="primary" onClick={onClose}>Continue shopping</button></section></div>;
}
