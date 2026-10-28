import { type FormEvent, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Heart, Menu, Package, Search, ShoppingBag, Sparkles, Star, UserRound, X } from 'lucide-react';
import './styles.css';
import './bag.css';
import { CheckoutPanel, OrderConfirmation, type OrderReceipt } from './Checkout';
import catalog from './products.json';

type Product = { id: string; name: string; brand: string; category: string; price: number; rating: string; color: string; icon: string };
type CartItem = { id: string; quantity: number };

const products: Product[] = catalog;
const categories = ['All things', 'Living', 'Wear', 'Tech', 'Travel'];
const api = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';
const money = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

function readCart(): CartItem[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem('commerce.cart') ?? '[]');
    if (!Array.isArray(saved)) return [];
    return saved.filter((item): item is CartItem => typeof item === 'object' && item !== null && products.some(p => p.id === item.id) && Number.isInteger(item.quantity) && item.quantity > 0);
  } catch { return []; }
}

async function errorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json();
    return body.detail ?? body.message ?? `Request failed (${response.status})`;
  } catch { return `Request failed (${response.status}). Check that the gateway and user service are running.`; }
}

function App() {
  const [cart, setCart] = useState<CartItem[]>(readCart);
  const [bagOpen, setBagOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [resumeCheckout, setResumeCheckout] = useState(false);
  const [receipt, setReceipt] = useState<OrderReceipt | null>(null);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [message, setMessage] = useState('');
  const [profile, setProfile] = useState<string | null>(localStorage.getItem('commerce.user'));
  const [category, setCategory] = useState('All things');
  const visibleProducts = category === 'All things' ? products : products.filter(product => product.category === category);
  useEffect(() => { localStorage.setItem('commerce.cart', JSON.stringify(cart)); }, [cart]);

  const addToBag = (id: string) => {
    setCart(current => current.some(item => item.id === id)
      ? current.map(item => item.id === id ? { ...item, quantity: item.quantity + 1 } : item)
      : [...current, { id, quantity: 1 }]);
    setBagOpen(true);
  };
  const bagCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const bagTotal = cart.reduce((sum, item) => sum + (products.find(p => p.id === item.id)?.price ?? 0) * item.quantity, 0);
  const checkoutItems = cart.flatMap(item => {
    const product = products.find(p => p.id === item.id);
    return product ? [{ id: item.id, name: product.name, quantity: item.quantity, unitPrice: product.price }] : [];
  });
  const beginCheckout = () => {
    setBagOpen(false);
    if (!localStorage.getItem('commerce.token')) {
      setResumeCheckout(true);
      setMessage('Sign in to place your order.');
      setAuthOpen(true);
      return;
    }
    setCheckoutOpen(true);
  };
  const requireSignIn = () => {
    localStorage.removeItem('commerce.token');
    localStorage.removeItem('commerce.user');
    setProfile(null);
    setCheckoutOpen(false);
    setResumeCheckout(true);
    setMessage('Your sign-in expired. Sign in to place your order.');
    setAuthOpen(true);
  };
  const closeAuth = () => { setAuthOpen(false); setResumeCheckout(false); };

  const submitAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') ?? '').trim();
    const password = String(form.get('password') ?? '');
    const payload = mode === 'login' ? { email, password } : { email, password, firstName: form.get('firstName'), lastName: form.get('lastName'), role: 'CUSTOMER' };
    try {
      const response = await fetch(`${api}/api/v1/auth/${mode === 'login' ? 'login' : 'register'}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(await errorMessage(response));
      if (mode === 'register') { setMode('login'); setMessage('Account created. Sign in to continue.'); return; }
      const tokens = await response.json();
      localStorage.setItem('commerce.token', tokens.accessToken);
      localStorage.setItem('commerce.user', email);
      setProfile(email);
      setAuthOpen(false);
      if (resumeCheckout) { setResumeCheckout(false); setCheckoutOpen(true); }
    } catch (error) {
      setMessage(error instanceof TypeError ? 'Cannot reach the gateway. Check that the gateway and user service are running.' : error instanceof Error ? error.message : 'Unable to complete request.');
    }
  };
  const signOut = () => {
    localStorage.removeItem('commerce.token'); localStorage.removeItem('commerce.user');
    setProfile(null); setAuthOpen(false);
    setResumeCheckout(false);
  };

  return <>
    <header><a className="logo" href="#home">nexa<span>.</span></a><nav><a href="#shop">Shop</a><a href="#new">New arrivals</a><a href="#story">Our story</a></nav><div className="actions"><button aria-label="Search"><Search /></button><button aria-label="Saved items"><Heart /></button><button aria-label="Account" onClick={() => { setMessage(''); setAuthOpen(true); }}><UserRound /></button><button className="bag" aria-label={`Bag, ${bagCount} items`} onClick={() => setBagOpen(true)}><ShoppingBag /><b>{bagCount}</b></button><button className="mobile" aria-label="Menu"><Menu /></button></div></header>
    <main id="home"><section className="hero"><div><p className="eyebrow"><Sparkles size={15}/> THE EDIT, CURATED FOR YOU</p><h1>Everyday objects.<br/><em>Extraordinary</em> feeling.</h1><p className="lede">Thoughtfully designed essentials for a more considered life.</p><a className="primary" href="#shop">Shop the collection <span>→</span></a></div><div className="hero-art"><div className="orb orb-one"/><div className="orb orb-two"/><div className="vessel">◒</div><small>01 — Spring / Summer</small></div></section><section className="categories">{categories.map(name => <button key={name} type="button" aria-pressed={category === name} onClick={() => setCategory(name)}>{name} <span>{name === 'All things' ? products.length : products.filter(product => product.category === name).length}</span></button>)}</section><section id="shop" className="catalog"><div className="section-head"><div><p className="eyebrow">DISCOVER</p><h2>Objects worth keeping.</h2></div><a href="#shop">View all products →</a></div><div className="grid">{visibleProducts.map(product => <article className="product" key={product.id}><div className={`product-art ${product.color}`}><button aria-label={`Save ${product.name}`}><Heart size={18}/></button><span>{product.icon}</span></div><div className="product-info"><p>{product.brand}</p><div><h3>{product.name}</h3><strong>{money(product.price)}</strong></div><small><Star size={14} fill="currentColor"/> {product.rating}</small><button className="add" onClick={() => addToBag(product.id)}>Add to bag</button></div></article>)}</div></section><section id="story" className="promise"><Package size={30}/><div><p className="eyebrow">THE NEXA PROMISE</p><h2>Made to last. Chosen with care.</h2></div><p>We work with considered makers and materials, so every item earns a lasting place in your everyday.</p></section></main>
    <footer><span>© 2026 NEXA COMMERCE</span><span>{profile ? `Signed in as ${profile}` : 'Thoughtfully chosen essentials'}</span></footer>
    {bagOpen && <div className="modal-backdrop" role="presentation" onClick={() => setBagOpen(false)}><section className="modal bag-panel" role="dialog" aria-modal="true" aria-label="Your bag" onClick={event => event.stopPropagation()}><button className="close" onClick={() => setBagOpen(false)} aria-label="Close bag"><X /></button><p className="eyebrow">YOUR BAG</p><h2>{bagCount} {bagCount === 1 ? 'item' : 'items'}</h2>{cart.length === 0 ? <p>Your bag is empty. Find something you love in the collection.</p> : <><div className="bag-items">{cart.map(item => { const product = products.find(p => p.id === item.id)!; return <div className="bag-item" key={item.id}><div className={`bag-art ${product.color}`}>{product.icon}</div><div><strong>{product.name}</strong><small>{money(product.price)} × {item.quantity}</small><button onClick={() => setCart(current => current.filter(entry => entry.id !== item.id))}>Remove</button></div><b>{money(product.price * item.quantity)}</b></div>; })}</div><div className="bag-total"><span>Subtotal</span><strong>{money(bagTotal)}</strong></div><button className="primary checkout-button" onClick={beginCheckout}>Continue to checkout</button></>}</section></div>}
    {authOpen && <div className="modal-backdrop" role="presentation" onClick={closeAuth}><section className="modal" role="dialog" aria-modal="true" aria-label="Your account" onClick={event => event.stopPropagation()}><button className="close" onClick={closeAuth} aria-label="Close account"><X /></button><p className="eyebrow">YOUR ACCOUNT</p>{profile ? <><h2>Welcome back.</h2><p>Signed in as {profile}</p><button className="switch" onClick={signOut}>Sign out</button></> : <><h2>{mode === 'login' ? 'Welcome back.' : 'Create your account.'}</h2><form onSubmit={submitAuth}>{mode === 'register' && <div className="two"><label>First name<input name="firstName" autoComplete="given-name" required /></label><label>Last name<input name="lastName" autoComplete="family-name" required /></label></div>}<label>Email<input name="email" type="email" autoComplete="email" required /></label><label>Password<input name="password" type="password" minLength={mode === 'register' ? 12 : undefined} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} required /></label><button className="primary" type="submit">{mode === 'login' ? 'Sign in' : 'Create account'} <span>→</span></button></form>{message && <p className="form-message" role="status">{message}</p>}<button className="switch" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setMessage(''); }}>{mode === 'login' ? 'New here? Create an account' : 'Already have an account? Sign in'}</button></>}</section></div>}
    {checkoutOpen && <CheckoutPanel api={api} items={checkoutItems} onClose={() => setCheckoutOpen(false)} onUnauthorized={requireSignIn} onPlaced={order => { setCart([]); setCheckoutOpen(false); setReceipt(order); }} />}
    {receipt && <OrderConfirmation receipt={receipt} onClose={() => setReceipt(null)} />}
  </>;
}

createRoot(document.getElementById('root')!).render(<App />);
